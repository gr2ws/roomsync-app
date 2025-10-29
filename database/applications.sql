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

create trigger trigger_application_rejected
after
update on applications for EACH row
execute FUNCTION notify_application_rejected ();

create trigger trigger_application_cancelled
after
update on applications for EACH row
execute FUNCTION notify_application_cancelled ();

create trigger trigger_application_accepted
after
update on applications for EACH row
execute FUNCTION notify_application_accepted ();

create trigger trigger_application_completed
after
update on applications for EACH row
execute FUNCTION notify_application_completed ();

create trigger trigger_new_application
after INSERT on applications for EACH row
execute FUNCTION notify_new_application ();