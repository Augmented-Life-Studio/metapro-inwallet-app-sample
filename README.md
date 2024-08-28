# metapro Wallet Integration Example Project

This project provides an example of how to integrate metapro wallet functionalities into a web application. It demonstrates how to interact directly with the metapro wallet, utilizing all of its functions to enhance user experience. The project is a simple web page that allows users to perform basic operations with the metapro wallet.

## Project Overview

The primary objective of this project is to show how to inject metapro wallet functionalities into your web application, enabling direct interaction with the wallet. This includes connecting the wallet, retrieving the wallet address, signing data, and managing user accounts through the metapro API.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (which includes npm)

### Installation

Follow these steps to set up and run the project locally:

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   The project will be available at `http://localhost:3000`.

## metapro Integration Testing

To test the metapro wallet integration, the project needs to be accessible via HTTPS. This is necessary for the metapro mobile app to interact with the wallet. For local testing, you can use [ngrok](https://ngrok.com/) to create a secure tunnel to your local server.

### Using ngrok for HTTPS

1. **Install ngrok globally:**

   ```bash
   npm install -g ngrok
   ```

2. **Run ngrok to create a tunnel:**

   ```bash
   ngrok http 3000
   ```

3. **Copy the HTTPS URL** provided by ngrok and use it in the metapro mobile app for testing.

   The project will be accessible at the ngrok URL.

## Supported User Flow

This project supports the following user actions:

1. **Connect to Wallet (useEffect)** 
2. **Retrieve Wallet Address (useEffect)** 
3. **Get Signature Hash** from the metapro API **(handleMetaproLogin)**
4. **Sign Hash** using the metapro wallet **(handleMetaproLogin)**
5. **Check Account Status** in metapro **(handleMetaproLogin)**

   - **If the account does not exist:**
     1. Create a new account in metapro (an auth token will be provided in the response).
   - **If the account exists:**
     1. Log in to metapro (an auth token will be provided in the response).

## Additional Resources

For more detailed information on metapro integration, please refer to the official [metapro documentation](https://docs.metaproprotocol.com/).