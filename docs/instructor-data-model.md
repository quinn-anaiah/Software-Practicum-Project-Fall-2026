# Instructor classrooms and scenarios: data-model proposal

This is the recommended starting model when the Instructor frontend moves from preview data to Supabase data.

## Core records

| Table | Purpose | Important fields |
| --- | --- | --- |
| `classrooms` | A course section/workspace for a term and one clinical discipline. | `id`, `crn`, `full_name`, `short_name`, `room`, `term`, `subrole_id`, `status`, `created_by`, timestamps |
| `classroom_instructors` | Which instructor can manage a classroom. | `classroom_id`, `profile_id`, `access_level` |
| `classroom_enrollments` | Learners assigned to a classroom. | `classroom_id`, `profile_id`, `status`, `enrolled_at` |
| `classroom_groups` | Instructor-created groups inside a classroom. | `id`, `classroom_id`, `name` |
| `classroom_group_members` | Learners in each group. | `group_id`, `profile_id` |
| `scenarios` | Reusable clinical learning cases. | `id`, `title`, `summary`, `status`, `created_by` |
| `scenario_versions` | Immutable clinical setup for a scenario revision. | `id`, `scenario_id`, `version`, `initial_patient_state`, `available_data`, `is_published` |
| `case_assignments` | A scenario assigned to one classroom. | `id`, `classroom_id`, `scenario_version_id`, `assigned_by`, `opens_at`, `due_at`, `status` |
| `case_assignment_learners` | The individual learner work records generated when an assignment is released. | `assignment_id`, `profile_id`, `group_id`, `encounter_status`, timestamps |

## Why assignments expand to individual learner records

An instructor may select an entire classroom or a group, but monitoring and grading happen per learner. When an assignment is released, create one `case_assignment_learners` record per learner. This preserves the actual recipients even if group membership changes later, and makes “not started / in progress / pending review / completed” queries simple.

## Scenario clinical data

Start with `initial_patient_state jsonb` and `available_data jsonb` inside `scenario_versions` for flexibility during early development. As the clinical model settles, normalize repeated entities such as medications, observations, mock orders, and laboratory results into dedicated scenario tables.

## Authorization rules

- An Instructor can create a classroom only when its `subrole_id` matches the Instructor profile's `sub_role_id`.
- A Student can join a classroom only when their `sub_role_id` matches the classroom's `subrole_id`.
- Instructors may read and manage only classrooms listed in `classroom_instructors`.
- Students may read only their own enrollment and `case_assignment_learners` records.
- A student must never receive another group’s scenario data through a direct query.
- Use RLS on every table and validate Instructor ownership again in server routes.
- Add an audit table for assignments, group changes, reviews, co-signatures, and grade release.

The matching-subrole rule crosses tables, so enforce it in the protected server route (and ideally a PostgreSQL trigger) rather than trying to rely on a front-end filter alone. This keeps it correct if another tool or future endpoint writes to the database.

## First API endpoints

1. `GET /api/instructor/dashboard`
2. `GET /api/instructor/classrooms`
3. `GET /api/instructor/classrooms/:id`
4. `POST /api/instructor/classrooms/:id/groups`
5. `POST /api/instructor/assignments`

The frontend pages should replace their local preview objects with these endpoints once the tables and policies are in place.
