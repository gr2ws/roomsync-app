create table public.reviews (
  review_id serial not null,
  user_id integer not null,
  property_id integer not null,
  rating integer not null,
  comment text null,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  date_created timestamp without time zone not null,
  constraint reviews_pkey primary key (review_id)
) TABLESPACE pg_default;