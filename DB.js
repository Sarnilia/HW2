const { v4: uuidv4 } = require('uuid')

const db = {
  posts: [
    {
      postId: uuidv4(),
      id: 'Admin1',
      URL: 'https://ceditor.setka.io/clients/ihN63X3GPpwHGoUWGJ3XfC32GauJoi5d/css/assets/36300/img/pngguru.com_21__iLZiCA.png',
      desc: 'Уточка смотрит влево <3',
    },
    {
      postId: uuidv4(),
      id: 'Admin2',
      URL: 'https://ceditor.setka.io/clients/ihN63X3GPpwHGoUWGJ3XfC32GauJoi5d/css/assets/36300/img/pngguru.com_21____%D0%BA%D0%BE%D0%BF%D0%B8%D1%8F_3rXjbw.png',
      desc: 'Уточка смотрит вправо <3',
    },
  ],

  users: [

  ],
}

module.exports = {
  db,
}
