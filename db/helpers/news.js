export const queryNewsGetBySlug =
  (slug) => ({
    text: `
      select
        *
      from
          news
      where
          slug = $1
    `,
    values: [
      slug,
    ],
  })
;

export const queryNewsGetAll =
  () => ({
    text: "select * from news",
  })
;

export const queryNewsUpdateBySlug =
  (
    slug,
    {
      date,
      content,
      title,
      description,
      imageId,
    },
  ) => {
    const news = {
      date,
      content,
      title,
      description,
      // eslint-disable-next-line camelcase
      image_id: imageId,
    };

    const filteredNews =
      Object
        .entries(news)
        .filter(([ _, v ]) => v)
    ;

    const setters = filteredNews.map(([ k ], i) => `${ k } = $${ i + 1 }`);
    const values = filteredNews.map(([ _, v ]) => v);

    return {
      text: `
        update
          news
        set
          ${ setters.join(", ") }
        where
          slug = $${ setters.length + 1 }
        returning
          slug
      `,
      values: [
        ...values,
        slug,
      ],
    };
  }
;