create table public.reports (
  report_id serial not null,
  reported_by integer not null,
  reported_user integer null,
  property_id integer null,
  reason text not null,
  description text null,
  status public.report_status not null default 'pending'::report_status,
  reviewed_by integer null,
  date_created timestamp without time zone not null,
  date_resolved timestamp without time zone null,
  constraint reports_pkey primary key (report_id)
) TABLESPACE pg_default;