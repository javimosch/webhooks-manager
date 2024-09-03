
## Current features

## Current benefits

## Current user stories

== AI: Do not modify content below here

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
