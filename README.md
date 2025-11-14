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
    The application requires a Google Gemini API key. While the app reads this from `process.env.API_KEY`, for local development, you'll need a way to serve this. The simplest method is to use a development server that supports environment variables.

    *   Create a file named `.env` in the project root.
    *   Add your API key to this file:
        ```
        API_KEY=your_google_gemini_api_key_here
        ```

4.  **Run the development server:**
    You can use a simple server like `vite` or configure `esbuild`'s dev server to load the `.env` file. For example, using `vite`:
    ```bash
    npm install -D vite
    npx vite
    ```
    This will start a local server, and you can access the application in your browser.

---

## Backend Setup (N8N & MongoDB)

This application is designed to be frontend-only for demonstration purposes, using mock services to simulate backend interactions. To make it work in a real-world scenario, you need to set up the following MongoDB collections and N8N workflows.

### MongoDB Collections

Create a MongoDB database with the following two collections:

#### 1. `brand_guides`

This collection stores the branding information for each domain.

**Schema:**
| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | MongoDB's unique identifier. |
| `domainId` | String | A unique identifier for the domain (e.g., "xxx", "yyy"). **Required.** |
| `stylePrompt`| String | The detailed text prompt describing the desired image style. **Required.** |
| `toneOfVoice`| String | The guide for the content's writing style. **Required.** |
| `styleImageUrl`| String | (Optional) A base64-encoded URL of a reference image for styling. |

#### 2. `content_briefs`

This collection stores all the content being worked on.

**Schema:**
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

### N8N Workflows

You need to create three webhook-triggered workflows in your N8N instance.

#### Webhook 1: New Content Brief Creation

This workflow handles the initial submission of a content brief from the app.

-   **Trigger:** Webhook
-   **URL:** Your N8N instance URL + `/webhook/new-brief`
-   **HTTP Method:** `POST`
-   **Expected JSON Body:**
    ```json
    {
      "title": "The Future of AI",
      "brief": "A detailed brief about AI.",
      "domainId": "xxx"
    }
    ```
-   **Workflow Steps:**
    1.  **Receive Webhook:** Get the data from the app.
    2.  **Generate Initial Content (Optional):** You can add a Gemini node here to generate a starting paragraph for the `content` field based on the `brief`.
    3.  **MongoDB Node (Insert):** Connect to your MongoDB instance.
        -   **Collection:** `content_briefs`
        -   **Operation:** Insert
        -   **Document:** Create a new document with the fields from the webhook, plus default values:
            -   `title`: from webhook
            -   `brief`: from webhook
            -   `domainId`: from webhook
            -   `content`: "This is the initial content..." (or from Gemini node)
            -   `status`: "Draft"
            -   `contentType`: "Blog" (or another default)
            -   `createdAt`: `{{new Date().toISOString()}}`
    4.  **Respond to Webhook:** Configure the "Respond to Webhook" node to send the newly created MongoDB document back to the application. The app expects the full `ContentBrief` object in response.

#### Webhook 2: Content Publishing

This workflow handles the final step of publishing the content immediately.

-   **Trigger:** Webhook
-   **URL:** Your N8N instance URL + `/webhook/publish`
-   **HTTP Method:** `POST`
-   **Expected JSON Body:**
    ```json
    {
      "id": "brief-12345",
      "title": "Final Title",
      "content": "Final content body...",
      "heroImageUrl": "http://image.url/hero.jpg",
      "domainId": "xxx",
      "contentType": "Blog"
    }
    ```
-   **Workflow Steps:**
    1.  **Receive Webhook:** Get the final content data.
    2.  **MongoDB Node (Update):**
        -   **Collection:** `content_briefs`
        -   **Operation:** Update
        -   **Filter:** `{ "_id": "{{$json.id}}" }` (or match based on your ID field)
        -   **Update:** `{ "$set": { "status": "Published" } }`
    3.  **Publishing Node (e.g., WordPress, Ghost):**
        -   Use a WordPress, Ghost, or HTTP Request node to publish the content.
        -   Use the `contentType` field to route it to the correct category or post type.
        -   Map the fields (`title`, `content`, `heroImageUrl`) from the webhook to the appropriate fields in your CMS.
    4.  **Respond to Webhook:** Send a success message back.

#### Webhook 3: Content Scheduling

This workflow handles scheduling content for future publication.

-   **Trigger:** Webhook
-   **URL:** Your N8N instance URL + `/webhook/schedule`
-   **HTTP Method:** `POST`
-   **Expected JSON Body:**
    ```json
    {
      "id": "brief-12345",
      "title": "Final Title",
      "content": "...",
      "heroImageUrl": "http://image.url/hero.jpg",
      "domainId": "xxx",
      "contentType": "Blog",
      "scheduledAt": "2024-10-26T10:00:00.000Z"
    }
    ```
-   **Workflow Steps:**
    1.  **Receive Webhook:** Get the final content data and schedule time.
    2.  **MongoDB Node (Update):**
        -   **Collection:** `content_briefs`
        -   **Operation:** Update
        -   **Filter:** `{ "_id": "{{$json.id}}" }`
        -   **Update:** `{ "$set": { "status": "Scheduled", "scheduledAt": "{{$json.scheduledAt}}" } }`
    3.  **Schedule Trigger/Wait Node:** This is the key step. Your workflow needs to wait until the `scheduledAt` timestamp. The specifics depend on your N8N setup (e.g., using a "Wait" node, or a cron job that checks for scheduled posts).
    4.  **Publishing Node (e.g., WordPress):** After the wait period, execute the same publishing logic as in Webhook 2.
    5.  **MongoDB Node (Update):** After successful publishing, update the status again.
        -   **Collection:** `content_briefs`
        -   **Filter:** `{ "_id": "{{$json.id}}" }`
        -   **Update:** `{ "$set": { "status": "Published" } }`
    6.  **Respond to Webhook:** Send an immediate success message back to the UI.
