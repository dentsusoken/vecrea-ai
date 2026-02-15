import "./env-shim";
import "dotenv/config";
import {
  Config,
  getCurrentUser,
  isSignedIn,
  signInWithEmail,
  verifyEmailOTP,
} from "@coinbase/cdp-core";
import {
  formatAssetBalance,
  formatTokenBalance,
  getAssetBalance,
  getTokenBalance,
} from "./helper/balance";
import {
  getChainLabel,
  getUsdcAddress,
  getWethAddress,
  isSupportedChain,
  SUPPORTED_CHAINS,
} from "./helper/chain";
import {
  persistAuthState,
  restoreAuthState,
} from "./helper/auth-persistence";
import { initializeWithNodeCompat } from "./helper/initializeWithNodeCompat";
import { type Address } from "viem";

const getConfig = (): Config => ({
  projectId: process.env.CDP_PROJECT_ID ?? "your-project-id",
  disableAnalytics: true,
  ethereum: {
    createOnLogin: "eoa",
  },
});

const getEvmAddressForConfig = (
  config: Config,
  user: Awaited<ReturnType<typeof getCurrentUser>>
): string | undefined => {
  const createOnLogin = config.ethereum?.createOnLogin;
  if (createOnLogin === "smart") {
    return (
      user?.evmSmartAccountObjects?.[0]?.address ?? user?.evmAccounts?.[0]
    );
  }
  return user?.evmAccountObjects?.[0]?.address ?? user?.evmAccounts?.[0];
};

const runAuthLogin = async (email: string): Promise<void> => {
  const authResult = await signInWithEmail({ email });
  console.log("✓ Verification code sent!");
  console.log(`ℹ Check your email (${email}) for a 6-digit code.\n`);
  console.log(`Flow ID: ${authResult.flowId}\n`);
  console.log("To complete sign-in, run:");
  console.log(
    `  npx tsx src/cli.ts auth verify ${authResult.flowId} <6-digit-code>`
  );
};

const runAuthVerify = async (flowId: string, otp: string): Promise<void> => {
  const result = await verifyEmailOTP({ flowId, otp });
  await persistAuthState();
  const email =
    result.user.authenticationMethods?.email?.email ?? "unknown@email.com";
  console.log("✔ Authentication successful!");
  console.log(`Successfully signed in as ${email}.\n`);
  console.log("You can now use wallet commands:");
  console.log("  npx tsx src/cli.ts balance");
  console.log("  npx tsx src/cli.ts address");
};

const FAUCET_URL = "https://portal.cdp.coinbase.com/products/faucet";

const main = async () => {
  const args = process.argv.slice(2);

  if (args[0] === "auth" && args[1] === "login") {
    const email = args[2];
    if (!email) {
      console.error("Usage: auth login <email>");
      process.exit(1);
    }
    console.log("Initializing CDP Core...");
    await restoreAuthState();
    await initializeWithNodeCompat(getConfig());
    await runAuthLogin(email);
    process.exit(0);
  }

  if (args[0] === "address") {
    await restoreAuthState();
    await initializeWithNodeCompat(getConfig());
    const signedIn = await isSignedIn();
    await persistAuthState();
    if (!signedIn) {
      console.log("✖ Failed to fetch address");
      console.log("Authentication required.\n");
      console.log("Sign in using one of:");
      console.log("  1. Email OTP:");
      console.log("     npx tsx src/cli.ts auth login <your-email>");
      console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
      process.exit(1);
    }
    const config = getConfig();
    const user = await getCurrentUser();
    const address = getEvmAddressForConfig(config, user);
    if (!address) {
      console.log("✖ Failed to fetch address");
      console.log("No EVM account found.\n");
      console.log("Sign in using one of:");
      console.log("  1. Email OTP:");
      console.log("     npx tsx src/cli.ts auth login <your-email>");
      console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
      process.exit(1);
    }
    console.log(address);
    process.exit(0);
  }

  if (args[0] === "balance") {
    const chainIdx = args.indexOf("--chain");
    const chain =
      chainIdx >= 0 && args[chainIdx + 1]
        ? args[chainIdx + 1].toLowerCase()
        : "base";
    if (!isSupportedChain(chain)) {
      console.error(`✖ Unsupported chain: ${chain}`);
      console.error(`Supported chains: ${SUPPORTED_CHAINS.join(", ")}`);
      process.exit(1);
    }
    await restoreAuthState();
    await initializeWithNodeCompat(getConfig());
    const signedIn = await isSignedIn();
    await persistAuthState();
    if (!signedIn) {
      console.log("✖ Failed to fetch balance");
      console.log("Authentication required.\n");
      console.log("Sign in using one of:");
      console.log("  1. Email OTP:");
      console.log("     npx tsx src/cli.ts auth login <your-email>");
      console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
      process.exit(1);
    }
    const config = getConfig();
    const user = await getCurrentUser();
    const evmAddress = getEvmAddressForConfig(config, user);
    if (!evmAddress) {
      console.log("✖ Failed to fetch balance");
      console.log("No EVM account found.\n");
      console.log("Sign in using one of:");
      console.log("  1. Email OTP:");
      console.log("     npx tsx src/cli.ts auth login <your-email>");
      console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
      process.exit(1);
    }
    const address = evmAddress as Address;
    const [ethWei, usdcRaw, wethRaw] = await Promise.all([
      getAssetBalance({ address, chain }),
      getTokenBalance({
        address,
        tokenAddress: getUsdcAddress(chain),
        chain,
      }),
      getTokenBalance({
        address,
        tokenAddress: getWethAddress(),
        chain,
      }),
    ]);
    console.log(`\nWallet Balances (${getChainLabel(chain)})`);
    console.log("────────────────────────");
    console.log(`USDC    $${formatTokenBalance(usdcRaw, 6)}`);
    console.log(`ETH     ${formatAssetBalance(ethWei)}`);
    console.log(`WETH    ${formatTokenBalance(wethRaw, 18)}`);
    process.exit(0);
  }

  if (args[0] === "faucet") {
    await restoreAuthState();
    await initializeWithNodeCompat(getConfig());
    const signedIn = await isSignedIn();
    await persistAuthState();
    const config = getConfig();
    const user = signedIn ? await getCurrentUser() : null;
    const evmAddress = user ? getEvmAddressForConfig(config, user) : undefined;
    const url = evmAddress
      ? `${FAUCET_URL}?address=${evmAddress}`
      : FAUCET_URL;
    console.log("Base Sepolia faucet (select ETH or USDC on the site):");
    console.log(`  ${url}`);
    process.exit(0);
  }

  if (args[0] === "status") {
    console.log("Initializing CDP Core...");
    await restoreAuthState();
    await initializeWithNodeCompat(getConfig());
    const signedIn = await isSignedIn();
    await persistAuthState();
    console.log("\nAuthentication");
    if (signedIn) {
      const user = await getCurrentUser();
      const email =
        user?.authenticationMethods?.email?.email ?? "unknown@email.com";
      console.log("✓ Authenticated");
      console.log(`Logged in as: ${email}`);
    } else {
      console.log("⚠ Not authenticated\n");
      console.log("Sign in using one of:");
      console.log("  1. Email OTP:");
      console.log("     npx tsx src/cli.ts auth login <your-email>");
      console.log("     npx tsx src/cli.ts auth verify <flow-id> <6-digit-code>");
    }
    process.exit(0);
  }

  if (args[0] === "auth" && args[1] === "verify") {
    const flowId = args[2];
    const otp = args[3];
    if (!flowId || !otp) {
      console.error("Usage: auth verify <flowId> <6-digit-code>");
      process.exit(1);
    }
    console.log("Initializing CDP Core...");
    await restoreAuthState();
    await initializeWithNodeCompat(getConfig());
    await runAuthVerify(flowId, otp);
    process.exit(0);
  }

  console.log("Usage:");
  console.log("  npx tsx src/cli.ts auth login <email>");
  console.log("  npx tsx src/cli.ts auth verify <flowId> <6-digit-code>");
  console.log("  npx tsx src/cli.ts status");
  console.log("  npx tsx src/cli.ts address");
  console.log("  npx tsx src/cli.ts balance [--chain base|base-sepolia]");
  console.log("  npx tsx src/cli.ts faucet");
  process.exit(1);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
