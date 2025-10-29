create table public.reviews (
  review_id serial not null,
  user_id integer not null,
  property_id integer not null,
  rating integer not null,
  comment text null,
  date_created timestamp without time zone not null,
  constraint reviews_pkey primary key (review_id),
  constraint fk_reviews_property foreign KEY (property_id) references properties (property_id) on update CASCADE on delete CASCADE,
  constraint fk_reviews_user foreign KEY (user_id) references users (user_id) on update CASCADE on delete set null
) TABLESPACE pg_default;

create trigger trigger_new_review
after INSERT on reviews for EACH row
execute FUNCTION notify_new_review ();