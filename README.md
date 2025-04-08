# Athena Chrome Extension

Welcome to the Athena Chrome Extension! This extension is designed to empower users by providing insightful analysis of any content from any website on the internet. Athena is live on the Chrome Web Store, making it easily accessible to enhance your browsing experience.

## Overview

The Athena Chrome Extension allows users to analyze web content seamlessly. By leveraging advanced technologies, it provides detailed insights into articles, including summaries, biases, and information about the authors and publications.

## How It Works

1. **Content Capture**: The extension captures content from any website you visit.
2. **Data Processing**: The captured content is sent to an Express app (hosted in a different GitHub repository). This app is responsible for:
   - Cleaning up the content.
   - Utilizing Large Language Models (LLMs) to intelligently parse and extract meaningful information.
3. **Analysis**:
   - Identifies the journalist(s) and publication responsible for the content (if applicable).
   - Stores this information in a database.
   - Generates summaries and analyzes biases for the article, journalist(s), and publication.

## Features

- **Content Analysis**: Get detailed insights into any web content.
- **Journalist and Publication Identification**: Automatically identifies and stores information about the authors and publications.
- **Summary and Bias Generation**: Provides concise summaries and bias analysis for better understanding.

## Installation

To install the Athena Chrome Extension, download it here on the [Chrome Web Store](https://chromewebstore.google.com/detail/athena-ai-extension/bpanflelokmegihakihekhnmbghkpnoh).

## Usage

1. Navigate to any website.
2. Click on the Athena icon in your Chrome toolbar.
3. View the analysis results directly in your browser.

## Contributing

We welcome contributions to enhance the Athena Chrome Extension. Please feel free to submit pull requests or report issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for using the Athena Chrome Extension. We hope it enhances your web browsing experience by providing valuable insights into the content you read.
