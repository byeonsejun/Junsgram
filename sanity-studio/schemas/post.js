export default {
  title: 'Post',
  name: 'post',
  type: 'document',
  fields: [
    {
      // 누가 작성했는지에 대한 정보
      title: 'Author',
      name: 'author',
      type: 'reference',
      to: [{type: 'user'}], // 레퍼런스중 유저를 가져옴 (유저에 관한 스키마타입이 그대로 들어있음)
    },
    {
      title: 'Photo',
      name: 'photo',
      type: 'image',
    },
    {
      title: 'Likes',
      name: 'likes',
      type: 'array',
      of: [
        {
          type: 'reference', // 다른 사용자의 레퍼런스를 참고할때
          to: [{type: 'user'}], // user타입에 대한 스키마를 참고함
        },
      ],
      validation: (Rule) => Rule.unique(), // 고유해야하는 값에 추가하는옵션
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
    },
  ],
  preview: {
    select: {
      title: 'comments.0.comment',
      authorName: 'author.name',
      authorUserName: 'author.username',
      media: 'photo',
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
