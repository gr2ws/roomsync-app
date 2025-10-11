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
  constraint reports_pkey primary key (report_id),
  constraint fk_reports_property foreign KEY (property_id) references properties (property_id) on update CASCADE on delete set null,
  constraint fk_reports_reported_by foreign KEY (reported_by) references users (user_id) on update CASCADE on delete set null,
  constraint fk_reports_reported_user foreign KEY (reported_user) references users (user_id) on update CASCADE on delete set null,
  constraint fk_reports_reviewed_by foreign KEY (reviewed_by) references users (user_id) on update CASCADE on delete set null
) TABLESPACE pg_default;