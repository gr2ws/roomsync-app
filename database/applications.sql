create table public.applications (
  application_id serial not null,
  property_id integer not null,
  renter_id integer not null,
  owner_id integer not null,
  status public.application_status not null default 'pending'::application_status,
  message text null,
  date_applied timestamp without time zone not null,
  date_updated timestamp without time zone null,
  constraint applications_pkey primary key (application_id),
  constraint fk_applications_owner foreign KEY (owner_id) references users (user_id) on update CASCADE on delete set null,
  constraint fk_applications_property foreign KEY (property_id) references properties (property_id) on update CASCADE on delete CASCADE,
  constraint fk_applications_renter foreign KEY (renter_id) references users (user_id) on update CASCADE on delete set null
) TABLESPACE pg_default;