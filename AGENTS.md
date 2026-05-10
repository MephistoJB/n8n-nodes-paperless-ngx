# AGENTS.md
- When performing git or gh operations, use the token from the environment variable GITHUB_PERSONAL_ACCESS_TOKEN or the file `github_token.md` (never commit this file to GitHub).
- You run on a Mac-mini Host
- The applications you are interested in are docker containers, which are administrated by a komodo instance.
- IMPORTANT: You are only allowed to run docker exec commands on the host without my explicit approval.
- Whenever you need access to GitHub use the Github mcp and the github skill
- Whenever you need access to n8n use the n8n mcp and the n8n skill
- Whenever you need access to komodo use the komodo mcp and the komodo skill
- IMPORTANT: run type check after every code change (prevents Claude from shipping broken types)
- Make minimal changes, don't refactor unrelated code (prevents Claude from rewriting your entire file)
- Create separate commits per logical change (prevents the 47-file monster commit)
- When unsure, explain both approaches and let me choose (prevents Claude from making architectural decisions for you)
- When you update the code. Update also the this AGENTS.md and the README.md if necessary to reflect the changes.

## Project
This project aims to connect n8n with my paperless-ngx instance as a community node for n8n

## Stack  
- tbd

## Commands
- tbd

## Architecture
- [folder] → [what lives here]
- [folder] → [what lives here]
- [folder] → [what lives here]
- [file] → [what this file does]

## Rules
- [Rule that prevents a specific mistake]
- [Rule that prevents a specific mistake]
- [Rule that prevents a specific mistake]
- IMPORTANT: [The one rule Claude keeps breaking]

## Workflow
- [How you want Claude to approach tasks]
- [Commit conventions]
- [Testing expectations]
- [When to ask vs when to act]

## Out of scope
- [Things Claude should not touch]
- [Files that are manually maintained]
- [Integrations Claude shouldn't modify]
