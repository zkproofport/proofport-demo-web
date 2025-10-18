# ZKProofport Demo dApp

This project is an example decentralized application (dApp) demonstrating how to use the ZKProofport SDK to verify on-chain KYC attestations without exposing user wallet addresses. It uses a 'DAO Airdrop Eligibility Check' scenario to showcase a practical use case for ZKProofport.

## Overview

Through this dApp, users can experience the full workflow: opening the ZKProofport Portal, generating a ZK proof for their Coinbase KYC completion, and returning that proof to this dApp for verification. Throughout the entire process, the user's actual wallet address is never revealed to this demo dApp.

## Live Demo

Try it yourself: **[https://proofport-demo.netlify.app/](https://proofport-demo.netlify.app/)**

## How it Works

1.  The user clicks the 'Continue to Coinbase Proof Portal' button.
2.  The ZKProofport SDK (`@zkproofport/sdk`) opens the Proof Portal (`zkproofport.com`) as an iFrame modal.
3.  The user connects their wallet within the Portal and initiates ZK proof generation.
4.  The Portal queries necessary on-chain data and generates the ZK proof locally in the browser.
5.  The generated proof is securely sent back to the SDK via `postMessage`.
6.  The SDK receives the proof, performs initial validation (timestamp, nonce, etc.), and returns the final proof data to the dApp.
7.  The dApp calls the `verifyZkKycProof` function to cryptographically verify the proof's correctness (either off-chain or on-chain).
8.  Based on the verification result, a success or failure message is displayed to the user.

## Prerequisites for Testing (Very Important)

This demo operates based on **Coinbase's on-chain KYC attestations (EAS)**.

To successfully test this demo, you **must connect a wallet within the Proof Portal (`zkproofport.com`) that has already completed Coinbase KYC verification**.

If the connected wallet does not have a valid Coinbase KYC attestation, the proof generation process in the Portal will fail with a "No valid KYC attestation found." error, and you will not be able to proceed.

## Running Locally

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/zkproofport/proofport-demo-web.git](https://github.com/zkproofport/proofport-demo-web.git)
    cd proofport-demo-web
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Configure environment variables:**
    Create a `.env.local` file in the project root and enter the RPC URL for the Base network (required for on-chain verification testing).
    ```env
    NEXT_PUBLIC_BASE_RPC_URL=https://your_base_rpc_url_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The demo dApp will now be running at `http://localhost:4000` (or your configured port).

## Core Logic

The main logic for this demo can be found in `src/app/DemoDapp.tsx`. The core functionality is implemented using the following two functions from the `@zkproofport/sdk` package:

* `openZkKycPopup()`: Opens the Proof Portal iFrame and retrieves the proof data.
* `verifyZkKycProof()`: Verifies the validity of the received proof data.

## Related Links

* **ZKProofport Main Site & Portal:** [https://zkproofport.com](https://zkproofport.com)
* **SDK Repository:** [https://github.com/zkproofport/sdk](https://github.com/zkproofport/sdk)
* **Circuits Repository:** [https://github.com/zkproofport/circuits](https://github.com/zkproofport/circuits)

## License

[MIT](https://www.google.com/search?q=LICENSE)