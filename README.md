# Content Publishing Hub

This is a web application designed to streamline the content creation and publishing workflow. It allows users to manage content briefs across different domains, generate AI-powered hero images tailored to specific brand guides, and push content to a publishing endpoint via a webhook.

## Features

-   **Secure Login:** Simple username/password authentication.
-   **Domain Management:** Organize content by different domains or brands.
-   **Content Brief Management:** Create new briefs via a form that submits to an n8n webhook, list existing briefs, and view/edit content.
-   **AI-Powered Image Generation:** Generate hero images for content based on the text and a configurable brand guide.
-   **Multimodal Image Styling:** Use a reference image to guide the AI's visual style.
-   **In-Prompt Image Editing:** Refine and edit generated images using simple text prompts.
-   **Brand Guides:** Define a unique "Tone of Voice" and "Image Style Prompt" for each domain to ensure brand consistency.
-   **Content Classification:** Categorize content as 'Blog', 'News', or 'Page' for correct placement on your website.
-   **Publishing & Scheduling Workflow:** Instantly publish content or schedule it for a future date and time. Each action calls a specific n8n webhook.

## Getting Started

### Prerequisites

-   Node.js and npm (or a compatible package manager).
-   A Google Gemini API Key.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    This project uses `esbuild` for development. If you don't have it, you can install it globally or use `npx`.

3.  **Set up Environment Variables:**
    See the **Configuration** section below for a full list of required variables. For local development, create a file named `.env` in the project root and add your `API_KEY`.

4.  **Run the development server:**
    You can use a simple server like `vite` or configure `esbuild`'s dev server to load the `.env` file. For example, using `vite`:
    ```bash
    npm install -D vite
    npx vite
    ```
    This will start a local server, and you can access the application in your browser.

---

## Configuration Checklist

Here is a complete list of variables and names you will need to define for the backend to work.

### Application Environment Variables

Create a `.env` file in the root of the project for local development.
-   `API_KEY`: Your Google Gemini API Key is required for all image generation features.

### N8N Webhook Endpoints

The following webhook URLs are currently hardcoded in `src/constants.ts`. For a production setup, it is recommended to move these to environment variables. You must create these three endpoints in your N8N instance.

-   `N8N_WEBHOOK_NEW_BRIEF`: Receives the initial content brief from the user. (e.g., `https://your-n8n.instance.com/webhook/new-brief`)
-   `N8N_WEBHOOK_PUBLISH`: Receives the final content for immediate publication. (e.g., `https://your-n8n.instance.com/webhook/publish`)
-   `N8N_WEBHOOK_SCHEDULE`: Receives the final content and a future date for scheduled publication. (e.g., `https://your-n8n.instance.com/webhook/schedule`)

### MongoDB Configuration

Your N8N workflows will need to connect to a MongoDB instance.
-   **`MONGODB_URL`**: Your MongoDB connection string.
-   **`MONGODB_DATABASE`**: The name of your database (e.g., `content_hub`).

### MongoDB Collections

Within your database, you must create the following collections with the specified names:

-   **`brand_guides`**: Stores brand style information.
-   **`content_briefs`**: Stores all content briefs and their status.
-   **`users` (Recommended)**: The current application uses hardcoded credentials (`patrik`/`34usdfdsf`) in `src/constants.ts` for simplicity. For a real application, you should create a `users` collection to store user credentials securely and update the login logic to query this collection.

---

## Backend Setup Details (N8N & MongoDB)

This section provides the schemas and workflow logic for the backend.

### MongoDB Collection Schemas

#### 1. `brand_guides`

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | MongoDB's unique identifier. |
| `domainId` | String | A unique identifier for the domain (e.g., "xxx", "yyy"). **Required.** |
| `stylePrompt`| String | The detailed text prompt describing the desired image style. **Required.** |
| `toneOfVoice`| String | The guide for the content's writing style. **Required.** |
| `styleImageUrl`| String | (Optional) A base64-encoded URL of a reference image for styling. |

#### 2. `content_briefs`

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | MongoDB's unique identifier. |
| `domainId` | String | The domain this content belongs to. **Required.** |
| `title` | String | The title of the article. **Required.** |
| `brief` | String | The original content brief provided by the user. **Required.** |
| `content` | String | The main body of the content, which can be edited. **Required.** |
| `status` | String | The current status of the brief. Can be 'Draft', 'Published', or 'Scheduled'. **Required.** |
| `contentType` | String | The type of content. Can be 'Blog', 'News', or 'Page'. **Required.** |
| `heroImageUrl`| String | (Optional) URL of the generated hero image. |
| `createdAt` | ISODate | The timestamp when the brief was created. **Required.** |
| `scheduledAt` | ISODate | (Optional) The timestamp when the content is scheduled to be published. |

---

### N8N Workflow Logic

#### Webhook 1: New Content Brief Creation (`/webhook/new-brief`)

-   **Trigger:** `POST` request.
-   **Expected Body:** `{ "title": "...", "brief": "...", "domainId": "..." }`
-   **Logic:**
    1.  Receive the webhook.
    2.  (Optional) Use a Gemini node to generate an initial paragraph of content from the `brief`.
    3.  Use a MongoDB node to **insert** a new document into the `content_briefs` collection with a default `status` of "Draft".
    4.  Respond to the webhook with the full document created in MongoDB.

#### Webhook 2: Content Publishing (`/webhook/publish`)

-   **Trigger:** `POST` request.
-   **Expected Body:** `{ "id": "...", "title": "...", "content": "...", "heroImageUrl": "...", "domainId": "...", "contentType": "..." }`
-   **Logic:**
    1.  Receive the webhook.
    2.  Use a MongoDB node to **update** the status of the corresponding brief to "Published".
    3.  Use a WordPress, Ghost, or HTTP Request node to send the content to your CMS for immediate publication.
    4.  Respond with a success message.

#### Webhook 3: Content Scheduling (`/webhook/schedule`)

-   **Trigger:** `POST` request.
-   **Expected Body:** `{ "id": "...", "title": "...", "content": "...", "heroImageUrl": "...", "domainId": "...", "contentType": "...", "scheduledAt": "..." }`
-   **Logic:**
    1.  Receive the webhook.
    2.  Use a MongoDB node to **update** the brief's `status` to "Scheduled" and set the `scheduledAt` timestamp.
    3.  The workflow should then either use a "Wait" node or be part of a separate cron-triggered workflow that queries for posts where `scheduledAt` is in the past and `status` is "Scheduled".
    4.  Once the time is reached, publish the content using the same logic as the "Publish" webhook.
    5.  After successful publication, update the brief's `status` in MongoDB to "Published".
    6.  Respond immediately to the initial webhook call with a success message.
