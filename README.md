# Content Publishing Hub

This is a web application designed to streamline the content creation and publishing workflow. It allows users to manage content briefs across different domains, generate AI-powered hero images tailored to specific brand guides, and push content to a publishing endpoint via a webhook.

## Features

-   **Secure Login:** Authenticate against a `users` collection.
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

-   A modern web browser.
-   A Google Gemini API Key.
-   An N8N instance and MongoDB database for the backend.

### Setup

1.  **Set up Environment Variables:**
    Create a `.env` file in the project's root directory. Copy the structure from the "`.env` File Example" section below and fill in your specific values. The application is configured to read these variables.

2.  **Configure Backend:**
    Using the schemas provided in the "Backend Setup Details" section, create the necessary collections in your MongoDB database and the corresponding webhook workflows in your N8N instance.

3.  **Run the application:**
    Open the `index.html` file in your browser. The application will load and connect to the services you configured.

---

## Configuration

### `.env` File Example

Create a file named `.env` in the root of your project and add the following keys. This file should **not** be committed to version control.

```env
# Your Google Gemini API Key
API_KEY="your_gemini_api_key_here"

# N8N Webhook Endpoints
N8N_WEBHOOK_NEW_BRIEF="https://your-n8n-instance.com/webhook/new-brief"
N8N_WEBHOOK_PUBLISH="https://your-n8n-instance.com/webhook/publish"
N8N_WEBHOOK_SCHEDULE="https://your-n8n-instance.com/webhook/schedule"

# MongoDB Configuration (for your N8N workflows)
MONGODB_URL="mongodb+srv://user:password@cluster.mongodb.net/"
MONGODB_DATABASE="content_hub"

# MongoDB Collection Names
MONGODB_COLLECTION_USERS="users"
MONGODB_COLLECTION_CONTENT_BRIEFS="content_briefs"
MONGODB_COLLECTION_BRAND_GUIDES="brand_guides"
```

---

## Backend Setup Details (N8N & MongoDB)

This section provides the schemas and workflow logic for the backend.

### MongoDB Collection Schemas

#### 1. `users`

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | MongoDB's unique identifier. |
| `email` | String | The user's email address for login. **Required, Unique.** |
| `password` | String | The user's password. For production, this should be hashed. **Required.** |
| `role` | String | User role (e.g., "client", "admin"). |
| `clientId` | String | An identifier for the client the user belongs to. |
| `created_at` | ISODate | Timestamp of user creation. |

#### 2. `brand_guides`

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | MongoDB's unique identifier. |
| `domainId` | String | A unique identifier for the domain (e.g., "xxx", "yyy"). **Required.** |
| `stylePrompt`| String | The detailed text prompt describing the desired image style. **Required.** |
| `toneOfVoice`| String | The guide for the content's writing style. **Required.** |
| `styleImageUrl`| String | (Optional) A URL of a reference image for styling. |

#### 3. `content_briefs`

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