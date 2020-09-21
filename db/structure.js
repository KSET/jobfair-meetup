export const base = `
create table if not exists translations
(
    id         serial                                             not null,
    key        text                                               not null,
    value      text                                               not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint translations_pk
        primary key (id),
    constraint translations_key
        unique (key)
);

create unique index if not exists translations_key_uindex
    on translations (key);

create table if not exists images
(
    id         serial                                             not null,
    creator_id integer                                            not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    name       text                                               not null,
    constraint images_pk
        primary key (id)
);

create table if not exists image_variations
(
    id        serial       not null,
    name      text         not null,
    path      text         not null,
    width     integer      not null,
    height    integer      not null,
    image_id  integer      not null,
    mime_type varchar(127) not null,
    constraint image_variations_pk
        primary key (id),
    constraint image_variations_images_id_fk
        foreign key (image_id) references images
            on update cascade on delete cascade
);

create unique index if not exists image_variations_path_uindex
    on image_variations (path);

create table if not exists news
(
    id          serial                                             not null,
    slug        text                                               not null,
    title       text                                               not null,
    description text                                               not null,
    content     text                                               not null,
    image_id    integer                                            not null,
    creator_id  integer                                            not null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    date        date                     default CURRENT_TIMESTAMP not null,
    constraint news_pk
        primary key (id),
    constraint news_images_id_fk
        foreign key (image_id) references images
);

create unique index if not exists news_slug_uindex
    on news (slug);

create table if not exists files
(
    id          serial                                             not null,
    name        varchar(255)                                       not null,
    size        integer                                            not null,
    hash        varchar(511)                                       not null,
    uploader_id integer                                            not null,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    path        text                                               not null,
    mime_type   varchar(127)                                       not null,
    constraint files_pk
        primary key (id)
);

create index if not exists uploads_hash_index
    on files (hash);

create index if not exists uploads_name_index
    on files (name);

create unique index if not exists files_path_uindex
    on files (path);

create table if not exists press_release
(
    id         serial                                             not null,
    title      text                                               not null,
    file_id    integer                                            not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint press_release_pk
        primary key (id),
    constraint press_release_files_id_fk
        foreign key (file_id) references files
);

create table if not exists press_gallery
(
    id          serial                                             not null,
    title       text                                               not null,
    description text                                               not null,
    image_id    integer                                            not null,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint press_gallery_pk
        primary key (id)
);

create table if not exists settings
(
    id    serial       not null,
    key   varchar(255) not null,
    value text         not null,
    constraint settings_pk
        primary key (id)
);

create unique index if not exists settings_key_uindex
    on settings (key);

create table if not exists db_versions
(
    id      serial                                             not null,
    "name"  varchar(255)                                       not null,
    date    timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint db_versions_pk
        primary key (id)
);

create unique index if not exists db_versions_name_uindex
    on db_versions (name);

create table if not exists press_kit
(
    id           serial                                           not null,
    title        text                                             not null,
    file_id      integer                                          not null,
    image_id     integer                                          not null,
    "order"      integer                                          not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    constraint press_kit_pk
        primary key (id),
    constraint press_kit_files_id_fk
        foreign key (file_id) references files
            on update cascade on delete cascade,
    constraint press_kit_images_id_fk
        foreign key (image_id) references images
            on update cascade on delete cascade
);

create table if not exists event_reservations
(
    id         serial                                             not null
        constraint event_reservations_pk
            primary key,
    event_id   integer                                            not null,
    user_id    integer,
    status     integer                                            not null,
    created_at timestamp with time zone default CURRENT_TIMESTAMP not null,
    updated_at timestamp with time zone default CURRENT_TIMESTAMP not null
);

create unique index if not exists event_reservations_event_id_user_id_uindex
    on event_reservations (event_id, user_id);

create index if not exists event_reservations_user_id_index
    on event_reservations (user_id);

`;


export const versions = [
  {
    name: "start",
    up: `
    alter table
      press_gallery
    add
      "order"
      integer
      default 0
      not null
    ;

    update
      press_gallery
    set
      "order" = id
    ;
  `,
    down: `
    alter table
      press_gallery
    drop column
      "order"
    ;
  `,
  },
];
