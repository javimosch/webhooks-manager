## Current features

- **Basic Authentication**: Secure routes with basic authentication.
- **Webhook Execution**: Execute webhooks with customizable methods and payloads.
- **Error Handling**: Centralized error handling for API and GUI routes.
- **Swagger Documentation**: API documentation using Swagger UI.
- **User Invitation System**: Allow users to be invited using invite codes.

## Current benefits

- **Security**: Protects sensitive routes with basic authentication.
- **Flexibility**: Supports various webhook methods and payloads.
- **User Management**: Simplifies user onboarding with an invitation system.
- **Documentation**: Provides easy-to-use API documentation.

## Current user stories

1. As a system administrator, I want to secure API routes with basic authentication so that only authorized users can access them.
2. As a developer, I want to execute webhooks with different HTTP methods and payloads to integrate with various external services.
3. As a user, I want to receive an invitation code to register for the service, ensuring controlled access.
4. As a developer, I want to see detailed API documentation so that I can understand and use the API effectively.

## Pending user stories

- US:19: As app, I support session based auth that stores session in mongo
- US20: As user, I'm redirected to a register view after clicking an invite link, so that I can setup my password
- US21: As user, I'm redirected to the billing screen once I setup my password, if billing is not set
- US22: As user, I'm redirected to the dashboard after clicking an invite link if I'm already logged and billing is set
- US23: As user, I'm redirected to the billing screen after clicking an invite link if I'm already logged and billing is not set
- US24: As user, I can only between Individual plan, which has a button to subscribe using a stripe payment link: https://buy.stripe.com/test_9AQ4gw1VW8ZqgvK003

## User stories Details

### US20: Account password setup

- Before redirecting, session is created using user that was just created
- A pretty vertical/horizontal cetered form using tailwind-cdn with a password field
- A button "Set password" can be click to set the password using a a setup route (sessionAuthMiddleware) (xhr call)
- A toast is shown to indicate success/fail
- User is redirected to billing view after 3 seconds

### US24: Pay the individual plan in the billing section

- Plans are shown (centered) (tailwind) (pretty)
- Each plans has features in a list
- If the user is logged and billing is not set, he should pay for a plan
- The only plan is the Individual plan with the following stripe link: https://buy.stripe.com/test_9AQ4gw1VW8ZqgvK003
- There is also a disabled plan called "Teams" that is shown but the user cannot subscribe yet. The disabled button label reads "Coming soon"
- The Teams plan shows an feature called Schedules (not implemented yet, do not mention it) that allows users to configure cron based schedules to launch webhooks or webhook types.
