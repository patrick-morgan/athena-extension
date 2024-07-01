import axios from "axios";

// Define the request payload
const requestPayload = {
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: `
        Objective: Generate a concise and accurate summary of the given news article. The summary should highlight the main points, key arguments, and significant evidence presented in the article. Ensure that the summary is factual and provides direct evidence by citing specific parts of the article using footnotes. The output should be in JSON format.

        Article Content:
        [Insert article content here]

        Guidelines for Summary:

        1. Main Points: Identify and summarize the main points and key arguments presented in the article.
        2. Key Evidence: Integrate significant evidence and examples directly within the main points using footnotes for references.
        3. Neutral Tone: Maintain a neutral tone, avoiding any bias or subjective language.
        4. Conciseness: Keep the summary concise, ideally between 100-150 words.
        5. Footnotes: Use footnotes to provide direct references or quotes from the article.
        6. JSON Format: Ensure the output is in the following JSON format:

        {
          "summary": "The article discusses the impact of climate change on coastal cities, noting that rising sea levels are leading to increased flooding[^1]. It examines the economic implications, highlighting the cost of infrastructure damage[^2]. Additionally, it addresses the challenges faced by local governments in mitigating these effects[^3].",
          "footnotes": {
            "^1": "In the past decade, sea levels have risen by an average of 3.3 millimeters per year, causing more frequent and severe coastal flooding.",
            "^2": "The damage to infrastructure is expected to cost billions of dollars annually by 2050.",
            "^3": "Local governments are struggling to implement effective measures due to budget constraints and political challenges."
          }
        }

        Summary:

        Please generate a summary based on the guidelines and example format provided above.
      `,
    },
  ],
  temperature: 0,
};

// Define the function to call the API
export const generateSummary = async (articleContent: string) => {
  try {
    // Update the article content in the request payload
    requestPayload.messages[0].content =
      requestPayload.messages[0].content.replace(
        "[Insert article content here]",
        articleContent
      );

    // Make the API call
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
      }
    );

    // Process the response
    const responseData = response.data.choices[0].message.content;
    const jsonResponse = JSON.parse(responseData);

    // Output the summary and footnotes
    console.log("Summary:", jsonResponse.summary);
    console.log("Footnotes:", jsonResponse.footnotes);

    return jsonResponse;
  } catch (error) {
    console.error("Error generating summary:", error);
    throw error;
  }
};

// Example usage
// const articleContent = `
//   Climate change is having a profound impact on coastal cities. Over the past decade, sea levels have risen by an average of 3.3 millimeters per year, causing more frequent and severe coastal flooding. This has significant economic implications, with the damage to infrastructure expected to cost billions of dollars annually by 2050. Local governments are struggling to implement effective measures due to budget constraints and political challenges.
// `;

// generateSummary(articleContent)
//   .then((response) => console.log("Generated Summary Response:", response))
//   .catch((error) => console.error("Error:", error));
