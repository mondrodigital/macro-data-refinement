# Deploying to GitHub Pages

This guide will walk you through the process of deploying the Macro Data Refinement Simulator to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your computer
3. Basic knowledge of Git commands

## Step 1: Create a GitHub Repository

1. Log in to your GitHub account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository (e.g., "macrorefinement")
4. Add a description (optional)
5. Choose whether to make it public or private
6. Click "Create repository"

## Step 2: Push Your Local Repository to GitHub

After creating the repository on GitHub, you'll see instructions for pushing an existing repository. Follow these steps:

```bash
# Add the remote repository
git remote add origin https://github.com/yourusername/macrorefinement.git

# Push your code to the main branch
git push -u origin main
```

Replace `yourusername` with your actual GitHub username.

## Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section (or click on "Pages" in the sidebar)
4. Under "Source", select the branch you want to deploy (usually "main")
5. Click "Save"

GitHub will provide you with a URL where your site is published (usually `https://yourusername.github.io/macrorefinement`).

## Step 4: Update Your README

Update the URLs in your README.md file to point to your actual GitHub repository and GitHub Pages site:

1. Replace `https://github.com/username/macrorefinement` with your actual repository URL
2. Replace `https://username.github.io/macrorefinement` with your actual GitHub Pages URL

## Step 5: Take a Screenshot

1. Run the application locally
2. Take a screenshot of the application
3. Save it as "preview.png" in the "screenshots" directory
4. Commit and push the screenshot to GitHub:

```bash
git add screenshots/preview.png
git commit -m "Add application screenshot"
git push
```

## Troubleshooting

- If your site isn't deploying, check the "Actions" tab in your repository to see if there are any errors in the GitHub Actions workflow.
- Make sure your repository is public if you're using the free GitHub Pages service.
- If your styles or scripts aren't loading, check that the paths in your HTML files are correct.

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions) 