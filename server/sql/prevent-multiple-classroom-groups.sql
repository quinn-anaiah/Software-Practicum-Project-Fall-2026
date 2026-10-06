-- Run this once in the Supabase SQL Editor.
-- It makes one student eligible for only one group within the same classroom.

-- This should return zero rows before you add the unique constraint.
select
  classroom_id,
  student_id,
  count(*) as group_count
from school.classroom_group_members
group by classroom_id, student_id
having count(*) > 1;

-- If the query above returned no rows, this safely adds the constraint.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'classroom_group_members_one_group_per_student'
      and conrelid = 'school.classroom_group_members'::regclass
  ) then
    alter table school.classroom_group_members
      add constraint classroom_group_members_one_group_per_student
      unique (classroom_id, student_id);
  end if;
end;
$$;
