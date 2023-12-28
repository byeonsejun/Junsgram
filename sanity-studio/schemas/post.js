export default {
  title: 'Post',
  name: 'post',
  type: 'document',
  fields: [
    {
      title: 'Author',
      name: 'author',
      type: 'reference',
      to: [{type: 'user'}],
    },
    {
      title: 'Photos',
      name: 'photos',
      type: 'array',
      of: [
        {
          type: 'image',
          name: 'image',
        },
      ],
      validation: (Rule) => Rule.min(1).error('최소한 하나의 이미지가 있어야 함'),
    },
    {
      title: 'Likes',
      name: 'likes',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'user'}],
        },
      ],
      validation: (Rule) => Rule.unique(),
    },
    {
      title: 'Comments',
      name: 'comments',
      type: 'array',
      of: [
        {
          title: 'Comment',
          name: 'comment',
          type: 'document',
          fields: [
            {
              title: 'Author',
              name: 'author',
              type: 'reference',
              to: [{type: 'user'}],
            },
            {
              title: 'Comment',
              name: 'comment',
              type: 'string',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'comments.0.comment',
      authorName: 'author.name',
      authorUserName: 'author.username',
      media: 'photos.0.asset',
    },
    prepare(selection) {
      const {title, authorName, authorUserName, media} = selection
      return {
        title,
        subtitle: `by ${authorName} (${authorUserName})`,
        media,
      }
    },
  },
}
