# Brian Maina's Submission
**Date**: April 19, 2026

**Email**: bmmaina@bu.edu

**Class Year**: <2028>

**Favorite F1 Team**: Scuderia Ferrari

## Core Requirements
Please check off which features you have implemented:
- [x] Built as a Single Page Application (SPA) without needing browser reloads.
- [x] An interesting and beautiful frontend design with a catchy title, apt description, and cool fonts/colors that looks good on any screen size.
- [x] Successfully fetches and renders data from an external F1 API (e.g., Ergast, OpenF1).
- [x] Displays F1 data in a table that is capped at 20 rows per page.
- [x] Table includes functional Next/Previous arrows to navigate the dataset.
- [x] Includes a search bar that filters the dataset based on simple text input.
- [x] Includes at least one chart or graph (using Chart.js, Recharts, D3, etc.) that visualizes the pulled data.
- [x] Features an animated background and smooth transitions/animations for UI elements.
- [x] Deployed the application using free deployment tools.

## Extra Features (Optional)
- [x] Allows the user to change the number of rows displayed at once (e.g., 10, 20, 50).
- [x] Includes "Jump to Beginning" and "Jump to End" pagination arrows.
- [x] Supports Regex (Regular Expressions) in the search bar.
- [x] Includes a custom UI for Boolean search logic (e.g., AND/OR dropdowns or toggles).

## Screen Recording 
**Video Link**: [(https://drive.google.com/file/d/1qyAP-aJf1fK5JsYh11EZ7JUIL2HX4iOe/view?usp=sharing)]

**Website Link**: [https://technical-assessment-fall-26-spua.vercel.app/]

## Written Portion
1. **How did the project go? What parts of it did you most enjoy / find yourself good at?**

Overall it went very well. As a redbull fan and a Ferrari fan, theming wasn't an issue, but what I really enjoyed was the data side of things. The Ergast API is slow and rate-limited so implementing a small worker pool with retries and a progress bar for "All Seasons" view to not get stuck while fetching the data seemed cool to me.

I have quite good experience in clean coding and refactoring and when all of this became reality, it became obvious that there were many pieces of code that could be reused. So, after that, I created reusable HeroButton, Pagination and ResultsTable components along with a couple of custom hooks.

2. **Was this technical assessment what you expected? If you had another two weeks to work on it, what would you add or change?**

The project was much larger than what I had initially planned. I thought it would just be "fetching data and putting it into a table", but after adding filtering using search, regex, booleans, charts and theming along with deploying, it became a whole project for me. Also, Recharts and Framer Motion were something I hadn't used before and I really enjoyed learning them.

If I had two more weeks, I would implement a simple backend layer that will cache the API responses rather than querying Ergast every time, create an individual drivers' race comparison feature, and retrieve lap times from OpenF1 to graph the data. In addition, I would redesign the Results tabular data structure, which becomes tight on mobile, replacing it with a card layout for smaller displays.
