Careflow | Software Practicum, Fall 2026

Careflow is a prototype electronic health record (EHR) teaching application for a pharmacy education practicum which could be expanded to other fields such as occupational therapy and phsyical therapy. It lets the team explore what a patient portal, student case workspace, instructor workspace, and administrator interface could look like when working together. The goal of this project is to simulate how an effective learning environment could look like when all interfaces are working together to deliver the best possible experience.
 The current repository is an early demo with most information as sample data and many controls demonstrate a proposed workflow rather than a connected clinical system.

What is Careflow right now?

| Area | Current demo | Important limitation |
| --- | --- | --- |
| Sign-in | Three local accounts open the instructor, student, or patient perspective with each with their respective dashboards. | Credentials and roles are checked against hard-coded demo users so this is not production authentication. |
| Patient | Dashboard, care teams, appointments, and health insights display a sample patient profile. | Appointment booking, messaging, and medical records are not connected to a service as of current. |
| Student | View an assigned case, advance its encounter status, write a SOAP note draft, and add draft orders. | These changes live only in React state and disappear after a reload. They are not shared with the instructor view. |
| Instructor | Browse the dashboard and workflow pages; create or switch classrooms, add learners and groups, confirm a roster, and configure cases in the browser. | Seeded monitoring, reviews, feedback, and grades are demonstrations. Case assignments are not yet delivered to student accounts. |
| Administrator | Dashboard, patient directory, appointment, analytics, and related page components exist in `src/pages/`. | There is no administrator demo account or administrator route in `src/App.jsx`, so these screens are not currently accessible through sign-in. |
| API and database | A small Express endpoint can query a local PostgreSQL test table. | The React dashboards do not call this endpoint as the repository does not include a database schema or migrations (Sprint 2 will address this gap). |

All people, appointments, case details, and clinical values shown in the UI are **sample data for demonstration**. Do not enter real patient information or reuse the demo passwords for a deployed system.

Running the UI demo

You will need Git, npm, and a Node.js version supported by the repository's Vite dependencies for example Node.js **20.19+ or 22.12+**. These can be downloaded using Homebrew if you have a Mac machine, or online flows exist to download the necessary tools. The following command pipeline was used in a Mac machine using bash commands.

```bash
git clone https://github.com/quinn-anaiah/Software-Practicum-Project-Fall-2026.git
cd Software-Practicum-Project-Fall-2026
npm install
npm run dev
```

Open the local URL printed by Vite normally `http://localhost:5173/`. The UI demo uses its own sample data so PostgreSQL is not needed to browse the dashboards. Further iterations of the project will feature abilities to input data and create a standard clinical setting. If 'npm install' is not working, 'npm i' is a great alternative to ensure to project dependencies are downloaded and present. To start the React app and the separate API together, use `npm run dev`.

Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Instructor | `dr.rivera@careflow.test` | `Careflow2026!` |
| Student | `javier.lopez@careflow.test` | `Student123!` |
| Patient | `morgan.lee@careflow.test` | `Welcome123!` |

The sign-in form is initially filled with the instructor credentials but use Log out to switch roles. The selected demo user is stored in browser `sessionStorage` for the current tab session. Other changes such as notes, orders, and classrooms, are held in memory and reset on a page reload.

Walking through the prototype as intended in a clinical setting.

1. Instructor Sign in as Dr. Rivera. Open 'Cohort & roster' to inspect or add a classroom, group, or learner, then open Cases & assignments to explore scenario setup. The later workflow pages contains expectations, monitoring, review, feedback, oversight, and closeout using sample information.
2. Student Sign In as Javier Lopez. Open the assigned sample case to see patient details, change the encounter stage, These actions demonstrate local UI behavior as they do not update the instructor's review data. However this demonstrates the basic flow as Students will be able to start an Encounter and able to diagnose as they navigate their training.
3. Patient sign in as Morgan Lee. Browse 'My health', 'My care team', 'Appointments', and 'Health insights' to see the sample patient portal for a complete overview of the type of data and information the patient will be able to see.

The administrator screens are source-code placeholders at this stage and are not part of this sign-in walkthrough.

Project structure

public/                 # Favicon and SVG icons
scripts/start-db.sh     # Starts Homebrew PostgreSQL 17 on macOS
server/index.js         # Express API and PostgreSQL pool
sprint_deliverables/    # Sprint 1 requirements/design and report PDFs
src/
    App.jsx             # Demo session, in-memory state, role-based page selection
    components/         # Shared dashboard layout, header, sidebar, and icons
    lib/                # Demo users, authentication, navigation, and sample data
    pages/              # Patient, student, instructor, and admin UI components
    routes/             # Small export file 
    index.css           # Application styles
       main.jsx            # React main entry file
package.json            # Dependencies
vite.config.js          # Vite setup and /api proxy to the Express server


`src/App.jsx` chooses a page component from the signed-in user's role and current navigation item. The app uses component state for demo edits; it does not currently use a routing library. The `src/lib/*.ts` files contain typed sample data and a small demo authentication helper, while most UI components are JSX.

API and optional PostgreSQL experiment

The server in `server/index.js` runs on port `3001` by default and exposes one endpoint

| Request | Behavior |
| --- | --- |
| `GET /api/patients` | Queries `id`, `first_name`, `last_name`, and `created_at` from the `test_patients` table, ordered by `id`. |

Start it separately with `npm run dev:api`, or alongside Vite with `npm run dev`. Vite proxies `/api` requests to `http://localhost:3001`. The API uses `DATABASE_URL` if set; otherwise it connects to the PostgreSQL database named by `PGDATABASE`, defaulting to `emr_db`. The script `bash scripts/start-db.sh` starts a Homebrew `postgresql@17` service on macOS, but **does not create the database or `test_patients` table**. You need to provision those separately before the endpoint can return rows. Until then, a request to `/api/patients` can return a database error even while the UI works normally.

There is no connection yet from the patient, student, instructor, or administrator screens to this API. The endpoint is an initial database experiment, not an implemented EHR data layer.

Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev:web` | Start only the Vite/React UI. |
| `npm run dev:api` | Start only the Express API with file watching. |
| `npm run dev` | Start the API and UI together. |
| `npm run build` | Create a production frontend build in `dist/`. |
| `npm run preview` | Preview the frontend build locally. |
| `npm run lint` | Run Oxlint. |

There is no automated test command in `package.json` yet.

Current scope and next steps

This repository is intended as a course prototype and not a live EHR or clinical decision support tool. Once the client is satisfied with the prototype, the goal is to secure a grant to start work on an active and main EHR that will act as the school's main learning foundation. The most important gaps to address as the project grows are to connect a real data model and migrations to the API, then replace UI sample data with API requests.
Implement server-side accounts, password handling, role permissions as they are related to each user and even their sub-role, and separate student records before using persistent data. Connect instructor assignments and review decisions to the appropriate student's cases, notes, and orders. Define and validate the clinical realism required for patient cases, medications, allergies, and interaction checks with the pharmacy client as they pertain to actual clinical environments including, but not limited to, clinical verbage and phrases, normal patient Encounter interactions, and clinical notetaking adhering to the SOAP template. And finally, add meaningful tests once the data flow and expected behaviors are agreed upon.

The [Sprint 1 requirements and design document](sprint_deliverables/Requirements%26design%20doc%20-%20Sprint%201.pdf) and [Sprint 1 report](sprint_deliverables/Sprint%20Report%20-%20Sprint%201.pdf) are in `sprint_deliverables/` for the team's earlier planning and progress.



Team 4: Anaiah Quinn, Christian Revilla, Derek Gamboa, and Francisco Vazquez. Jazmin Huerta was the Sprint 1 scrum master. Derek Gamboa was the Sprint 2 scrum master.
