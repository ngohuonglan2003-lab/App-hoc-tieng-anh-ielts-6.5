'use strict';
/* ===== Ngân hàng đề có sẵn (nội dung do tác giả app tự soạn, theo định dạng IELTS Academic) ===== */
const tf = (q, a, explain) => ({ q, a, explain });
const mc = (q, options, a, explain) => ({ q, options, a, explain });
const fl = (q, a, alts, explain) => ({ q, a, alts: alts || [], explain });
const TFNG = 'Do the following statements agree with the information given in the passage?\nWrite TRUE if the statement agrees with the information, FALSE if it contradicts the information, NOT GIVEN if there is no information on this.';

const BANK_TOPICS = ['Environment', 'Education', 'Technology', 'Health', 'Society', 'Work', 'Travel', 'Hometown'];

/* ================= READING ================= */
const READING_BANK = [
  {
    id: 'r1', topic: 'Environment', level: 1, title: 'Cooling the Concrete Jungle',
    paragraphs: [
      { label: 'A', text: "Cities are typically several degrees warmer than the countryside around them, a phenomenon known as the urban heat island effect. Dark surfaces such as asphalt roads and tar roofs absorb the sun's energy during the day and release it slowly at night, so that urban areas rarely cool down fully. The problem is compounded by the scarcity of vegetation, which in rural areas lowers temperatures through shade and the evaporation of water from leaves. Waste heat from air conditioners, vehicles and factories adds further warmth. As the global climate warms and more people move to cities, heat has become one of the most serious urban hazards, responsible for more deaths in many countries than floods or storms." },
      { label: 'B', text: "One of the simplest responses is to change the colour of roofs. A so-called cool roof is coated with a pale, reflective material that bounces sunlight back into the sky instead of absorbing it. Trials in several cities have shown that such roofs can be up to thirty degrees cooler than conventional dark ones on a summer afternoon, which cuts the energy that buildings use for air conditioning. Critics point out that the benefit is smaller in cold climates, where extra heat in winter is welcome, and that reflective surfaces can degrade as dust and algae accumulate, so they must be cleaned or recoated every few years. Nevertheless, the technology is cheap, and several municipalities now require it on new buildings." },
      { label: 'C', text: "A second strategy is to bring plants back into the city. Trees cool their surroundings in two ways: their canopies block sunlight, and the water they release into the air consumes heat as it evaporates. A mature tree can have the cooling effect of several domestic air conditioners running continuously. Where there is no space at ground level, planners have turned to green roofs, in which a layer of soil and vegetation covers the top of a building. Green roofs also absorb rainwater, which reduces flooding, and they provide habitats for insects and birds. However, they are heavy and expensive to install and maintain, and they need watering during droughts, which is precisely when water is scarce." },
      { label: 'D', text: "Pavements and roads, which can cover more than a third of a city's surface, are a growing focus of research. Engineers have developed reflective coatings for asphalt and porous paving that lets water seep through and cool the surface by evaporation. In one pilot project in Los Angeles, painting streets a light grey lowered surface temperatures by around ten degrees. Yet residents complained about glare, and the paint wore away faster than expected on busy roads, raising questions about whether the approach is practical on a large scale." },
      { label: 'E', text: "Technology alone, however, will not solve the problem. Researchers who have studied heat deaths emphasise that the most vulnerable people, namely the elderly, the poor and those living alone, often lack air conditioning or cannot afford to run it. Heat-action plans in cities such as Ahmedabad in India therefore combine reflective roofs with early-warning systems, public cooling centres and advice on hydration. Evaluations suggest that these programmes have saved lives at a modest cost. The lesson, experts argue, is that the most effective responses treat heat not only as an engineering challenge but as a public health and social one." }
    ],
    groups: [
      { type: 'tfng', instruction: TFNG, qs: [
        tf('Urban areas stay warm at night partly because dark surfaces release stored heat slowly.', 'TRUE', 'Đoạn A: dark surfaces “release it slowly at night”.'),
        tf('Heat causes more deaths than any other natural hazard in every country.', 'FALSE', 'Đoạn A chỉ nói “in many countries” (nhiều nước), không phải mọi nước.'),
        tf('Cool roofs are equally effective in cold and hot climates.', 'FALSE', 'Đoạn B: lợi ích “smaller in cold climates”.'),
        tf('The Los Angeles street-painting project was paid for by the city government.', 'NOT GIVEN', 'Đoạn D không nói ai trả tiền.')
      ] },
      { type: 'mcq', instruction: 'Choose the correct letter, A, B, C or D.', qs: [
        mc('According to the writer, trees cool the air because they', ['A absorb heat from the soil', 'B shade surfaces and release water that evaporates', 'C reflect sunlight into the sky', 'D reduce the amount of waste heat from factories'], 'B', 'Đoạn C: canopies block sunlight + water evaporates and consumes heat.'),
        mc('What was a problem with painting streets light grey in Los Angeles?', ['A It did not lower surface temperatures', 'B It was disliked by residents and did not last long', 'C It increased the risk of flooding', 'D It was banned on busy roads'], 'B', 'Đoạn D: residents complained about glare, paint wore away faster than expected.'),
        mc("What is the writer's main point in the final paragraph?", ['A Air conditioning should be banned', 'B Technology is the only solution to urban heat', 'C Effective responses must also address social and health factors', "D Ahmedabad's plan is too expensive to copy"], 'C', 'Đoạn E: “not only as an engineering challenge but as a public health and social one”.')
      ] },
      { type: 'fill', instruction: 'Complete the sentences below.\nWrite NO MORE THAN TWO WORDS from the passage for each answer.', qs: [
        fl('Cool roofs lose effectiveness over time because ______ and algae build up on them.', 'dust', [], 'Đoạn B: “as dust and algae accumulate”.'),
        fl('Green roofs need ______ during droughts, when water is hard to find.', 'watering', [], 'Đoạn C: “they need watering during droughts”.'),
        fl('Porous paving allows water to ______ through, cooling the surface by evaporation.', 'seep', [], 'Đoạn D: “lets water seep through”.')
      ] }
    ]
  },
  {
    id: 'r2', topic: 'Technology', level: 2, title: 'The Productivity Puzzle of Automation',
    paragraphs: [
      { label: 'A', text: "In 1930 the economist John Maynard Keynes predicted that, within a century, technological progress would be so great that people in rich countries would work only fifteen hours a week. Nearly a century on, machines have transformed manufacturing, farming and offices, yet the working week has shortened by only a few hours. The gap between prediction and reality has become a favourite puzzle for economists, and one that has gained urgency as artificial intelligence and robotics advance into tasks once thought to require human judgement." },
      { label: 'B', text: "Part of the explanation is that automation rarely eliminates entire occupations; it more often changes the tasks within them. When cash machines spread across the United States in the 1980s, many expected bank tellers to disappear. Instead, because each branch became cheaper to run, banks opened more of them, and the number of tellers actually rose for decades. Their work shifted away from counting cash towards advising customers and selling services. Studies of other industries reveal a similar pattern: a technology that makes one task cheaper often increases demand for the whole service." },
      { label: 'C', text: "Nevertheless, the benefits are unevenly shared. Research by labour economists indicates that routine jobs in the middle of the pay scale, such as clerical work and assembly-line tasks, are the easiest to automate, whereas both highly skilled professional work and low-paid manual service work are harder to replace. The result has been a 'hollowing out' of the labour market, with growth concentrated at the top and bottom and fewer opportunities for those in between. Wages for workers displaced from routine jobs often fall when they move into the lower-paid service sector." },
      { label: 'D', text: "Why, then, do we not work fifteen hours a week? Some economists argue that rising productivity has been absorbed by rising expectations rather than by leisure. As incomes grew, people wanted larger homes, more travel and newer devices, and they were prepared to work to afford them. Others point to the growth of status competition, in which people compare themselves with their peers and keep striving for more. A smaller group suggests that many people simply find meaning and social contact in work and would not choose to give it up." },
      { label: 'E', text: "Policymakers are divided over how to respond to the next wave of automation. Proposals include retraining programmes, a universal basic income paid to every citizen, and taxes on robots to fund support for displaced workers. Sceptics warn that retraining schemes have a poor record, because older workers rarely move successfully into entirely new fields, and that a universal income would be extremely costly. What most analysts agree on is that the pace of change matters: gradual shifts give workers, schools and companies time to adapt, whereas sudden ones produce hardship that lingers for a generation." }
    ],
    groups: [
      { type: 'match', instruction: 'The passage has five paragraphs, A–E.\nChoose the correct heading for paragraphs B–E from the list of headings below.', options: ['i  Why leisure has not increased as predicted', 'ii  A prediction that has not come true', 'iii  An unexpected effect of cheaper services', 'iv  An uneven distribution of the gains', 'v  Competing ideas for managing change', 'vi  The dangers of ignoring older workers'], qs: [
        tf('Paragraph B', 'iii', 'Ngân hàng mở thêm chi nhánh vì rẻ hơn → số giao dịch viên tăng.'),
        tf('Paragraph C', 'iv', 'Lợi ích không chia đều: “unevenly shared”.'),
        tf('Paragraph D', 'i', 'Giải thích vì sao không làm 15 giờ/tuần.'),
        tf('Paragraph E', 'v', 'Các đề xuất: retraining, UBI, thuế robot – ý kiến trái chiều.')
      ] },
      { type: 'tfng', instruction: TFNG, qs: [
        tf('The number of bank tellers fell sharply after cash machines were introduced.', 'FALSE', 'Đoạn B: số lượng giao dịch viên “actually rose for decades”.'),
        tf('Wages of workers displaced from routine jobs tend to rise when they find new work.', 'FALSE', 'Đoạn C: wages “often fall”.'),
        tf('A universal basic income has already been introduced in several countries.', 'NOT GIVEN', 'Bài chỉ nói đây là một đề xuất.')
      ] },
      { type: 'fill', instruction: 'Complete the sentences below.\nWrite NO MORE THAN TWO WORDS from the passage for each answer.', qs: [
        fl('Tellers’ duties moved towards advising customers and ______ services.', 'selling', [], 'Đoạn B: “advising customers and selling services”.'),
        fl('Growth has been concentrated at the top and the ______ of the pay scale.', 'bottom', [], 'Đoạn C: “concentrated at the top and bottom”.'),
        fl('Most analysts agree that ______ change gives workers time to adapt.', 'gradual', ['gradual shifts'], 'Đoạn E: “gradual shifts give workers … time to adapt”.')
      ] }
    ]
  },
  {
    id: 'r3', topic: 'Health', level: 3, title: 'Sleep and the Adolescent Brain',
    paragraphs: [
      { label: 'A', text: "Anyone who has tried to wake a teenager for school understands that adolescents do not seem to be built for early mornings. For decades this was blamed on laziness and late-night screen use. Sleep researchers now know that something more fundamental is at work. During puberty the body's internal clock shifts, so that the hormone melatonin, which signals that it is time to sleep, is released roughly two hours later than in children or adults. A fifteen-year-old who is told to go to bed at ten o'clock is therefore being asked to fall asleep at a time when their biology is telling them to stay awake." },
      { label: 'B', text: "The consequences of this mismatch are measurable. Teenagers need between eight and ten hours of sleep each night, yet surveys in many countries find that fewer than a third of them achieve this on school days. Chronic sleep loss is linked to poorer concentration, memory and mood, and some studies associate it with higher rates of anxiety, depression and road accidents among young drivers. Sleeping in at weekends does not fully repair the damage, since irregular patterns can further disturb the body clock, a condition sometimes called 'social jet lag'." },
      { label: 'C', text: "In response, a growing number of schools have delayed their start times. In a well-known trial in Seattle, moving the first lesson from 7.50 am to 8.45 am increased the average amount of sleep students got by 34 minutes a night; attendance improved, and students' grades rose by a small but significant margin. Similar results have been reported in parts of the United Kingdom and Australia. Not everyone is convinced, however. Parents worry about transport and childcare, sports coaches about losing daylight for training, and some teachers about the effects on after-school jobs." },
      { label: 'D', text: "Technology complicates the picture. Many teenagers keep phones in their bedrooms, and the blue-tinted light from screens can suppress melatonin further, while notifications interrupt sleep throughout the night. Experts therefore recommend that devices be charged outside the bedroom. Yet researchers caution against blaming screens alone: in the Seattle study the benefit of later start times held regardless of how much students used their phones, suggesting that the school timetable plays an independent role." },
      { label: 'E', text: "Critics of later start times note that evidence on long-term benefits is still limited, because most studies follow students for only a year or two. Even so, the consensus among sleep scientists is increasingly clear. Treating adolescent sleep patterns as a public health matter rather than a question of discipline, they argue, would allow schools to support learning and wellbeing at little cost. As one researcher put it, asking teenagers to concentrate at eight in the morning is a little like asking adults to start work at five." }
    ],
    groups: [
      { type: 'mcq', instruction: 'Choose the correct letter, A, B, C or D.', qs: [
        mc("What do sleep researchers now believe about teenagers' late bedtimes?", ['A They are mainly caused by screen use', 'B They reflect a biological shift in the body clock', 'C They are a result of laziness', 'D They can be corrected by discipline'], 'B', 'Đoạn A: đồng hồ sinh học dịch chuyển trong tuổi dậy thì.'),
        mc("What is meant by 'social jet lag'?", ['A Tiredness caused by long journeys', 'B Disrupted sleep resulting from irregular sleep patterns', 'C Reluctance to socialise with friends', 'D A medical condition caused by phones'], 'B', 'Đoạn B: “irregular patterns can further disturb the body clock”.'),
        mc('What did the Seattle trial find?', ['A Attendance fell but grades improved', 'B Students slept longer and performed slightly better', 'C Students used their phones less', 'D Sports results improved'], 'B', 'Đoạn C: +34 phút ngủ, attendance & grades tăng.'),
        mc('What point does the writer make about screens in paragraph D?', ['A They are the main cause of sleep problems', 'B They should be banned in schools', 'C They are not the only factor affecting sleep', 'D They help teenagers relax'], 'C', 'Đoạn D: “caution against blaming screens alone”.')
      ] },
      { type: 'tfng', instruction: TFNG, qs: [
        tf('Teenagers release melatonin earlier than adults do.', 'FALSE', 'Đoạn A: released “two hours later”.'),
        tf('Later school start times have been tried in more than one country.', 'TRUE', 'Đoạn C: Seattle, UK, Australia.'),
        tf('Teenagers in Asia sleep less than teenagers in Europe.', 'NOT GIVEN', 'Không có thông tin so sánh châu Á – châu Âu.')
      ] },
      { type: 'fill', instruction: 'Complete the sentences below.\nWrite NO MORE THAN TWO WORDS from the passage for each answer.', qs: [
        fl('Surveys show that fewer than a ______ of teenagers get enough sleep on school days.', 'third', [], 'Đoạn B: “fewer than a third”.'),
        fl('Experts recommend that devices be ______ outside the bedroom.', 'charged', [], 'Đoạn D: “devices be charged outside the bedroom”.'),
        fl('Critics say evidence on ______ benefits of later start times is still limited.', 'long-term', ['long term'], 'Đoạn E: “evidence on long-term benefits is still limited”.')
      ] }
    ]
  }
];

/* ================= LISTENING ================= */
const LISTENING_BANK = [
  {
    id: 'l1', topic: 'Education', section: 1, title: 'Section 1 – Enrolling on a course', context: 'A telephone conversation between a language-centre receptionist and a student.',
    script: [
      ['Anna', 'Good morning, City Language Centre, Anna speaking. How can I help you?'],
      ['Mark', "Hello. I'd like some information about your evening English courses, please."],
      ['Anna', 'Certainly. We have new courses starting next month. Could I take your name first?'],
      ['Mark', "It's Mark Peterson. That's P-E-T-E-R-S-O-N."],
      ['Anna', 'Thank you, Mr Peterson. Which level are you interested in? We have beginner, elementary, intermediate and upper-intermediate.'],
      ['Mark', 'I took an online test and it said I was upper-intermediate, but my last teacher thought I should do intermediate first, so I would like to start there.'],
      ['Anna', "That sounds sensible. The intermediate class meets on Tuesdays and Thursdays, but I'm afraid that one is full. There's another one on Mondays and Wednesdays."],
      ['Mark', 'Mondays and Wednesdays would be fine. What time does it start?'],
      ['Anna', 'It runs from half past six until half past eight. Some people think it starts at seven, but that is the advanced class.'],
      ['Mark', 'Okay, half past six is good for me after work. How long is the course, and how much is it?'],
      ['Anna', 'It lasts twelve weeks and the fee is three hundred and eighty pounds. If you pay before the first of next month you get a ten per cent discount.'],
      ['Mark', 'That is helpful. Can I pay when I come in, in cash?'],
      ['Anna', "We don't take cash at reception any more, I'm afraid. You can pay online by card, or by bank transfer."],
      ['Mark', 'Online will be easiest then.'],
      ['Anna', "Wonderful. I'll email you the link this afternoon."]
    ].map(([speaker, text]) => ({ speaker, text })),
    groups: [
      { type: 'fill', instruction: 'Complete the form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', qs: [
        fl('Surname: ______', 'Peterson', [], 'Mark đánh vần P-E-T-E-R-S-O-N.'),
        fl('The class he will join is on Mondays and ______', 'Wednesday', ['Wednesdays'], 'Lớp thứ Ba/Năm đã đầy → chọn thứ Hai và thứ Tư.'),
        fl('Class starts at ______ pm', '6.30', ['6:30', 'half past six', '6.30pm', '18.30', '18:30'], '“half past six” = 6.30 (7 giờ là lớp advanced – bẫy).'),
        fl('Fee: £ ______', '380', ['three hundred and eighty', '£380'], '“three hundred and eighty pounds”.')
      ] },
      { type: 'mcq', instruction: 'Choose the correct letter, A, B or C.', qs: [
        mc('Which level will Mark start with?', ['A Beginner', 'B Intermediate', 'C Upper-intermediate'], 'B', 'Mark muốn bắt đầu ở Intermediate theo lời thầy cũ.'),
        mc('How will Mark pay?', ['A In cash at reception', 'B Online', 'C By bank transfer'], 'B', 'Reception không nhận tiền mặt; Mark chọn “Online”.')
      ] }
    ]
  },
  {
    id: 'l2', topic: 'Travel', section: 2, title: 'Section 2 – Welcome to the Botanical Gardens', context: 'A guide gives practical information to visitors at a botanical garden.',
    script: [['Guide', "Good morning everyone and welcome to Greenfield Botanical Gardens. Before we start, a few practical points. The gardens open at nine o'clock every day, and the main gates close at six, although the glasshouse closes earlier, at half past four, so do visit that first if you are short of time."],
      ['Guide', 'Tickets are eight pounds for adults, and five pounds for students with a valid card. Our guided walks leave from the visitor centre, not from the main gate as it says on the old map, at ten and at two.'],
      ['Guide', "If you would rather explore on your own, the rose garden is at its best in June, when around two hundred varieties are in flower, and the tropical plants are in the glasshouse all year round."],
      ['Guide', "You are welcome to take photographs, but please don't fly drones, as they disturb the birds. There is a café beside the lake, which serves hot meals until three, and a smaller kiosk by the main gate for drinks and snacks."],
      ['Guide', "Finally, please keep to the paths in the wildflower meadow. We are trying to let the plants seed naturally. Now, if you'd like to follow me."]].map(([speaker, text]) => ({ speaker, text })),
    groups: [
      { type: 'mcq', instruction: 'Choose the correct letter, A, B or C.', qs: [
        mc('Where do the guided walks start?', ['A At the main gate', 'B At the visitor centre', 'C At the café'], 'B', '“leave from the visitor centre, not from the main gate”.'),
        mc('What are visitors asked NOT to do?', ['A Take photographs', 'B Fly drones', 'C Walk in the wildflower meadow'], 'B', 'Chụp ảnh được phép; “please don’t fly drones”. (Đồng cỏ: chỉ đi trên lối đi.)'),
        mc('Where is the café?', ['A Beside the lake', 'B By the main gate', 'C In the glasshouse'], 'A', '“a café beside the lake”; ki-ốt nhỏ mới ở cổng chính.')
      ] },
      { type: 'fill', instruction: 'Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', qs: [
        fl('The glasshouse closes at ______', '4.30', ['4:30', 'half past four', '16.30', '16:30', '4.30 pm'], 'Cổng chính đóng 6 giờ, nhưng nhà kính đóng sớm hơn: half past four.'),
        fl('Student ticket: £ ______', '5', ['five', '£5'], '“five pounds for students”.'),
        fl('Roses are at their best in ______', 'June', [], '“the rose garden is at its best in June”.')
      ] }
    ]
  },
  {
    id: 'l3', topic: 'Environment', section: 3, title: 'Section 3 – A student research project', context: 'Two students discuss their project with their tutor.',
    script: [['Dr Hall', "So, Liam, Priya, how is the project on plastic use on campus coming along?"],
      ['Liam', "Well, we've agreed on the focus: we want to look at single-use plastics in the cafeterias rather than the whole university, because that is more manageable."],
      ['Priya', "We were considering interviews at first, but we've decided to use an online questionnaire instead. It means we can reach far more people, and the results are easier to compare."],
      ['Dr Hall', 'That makes sense. How many responses are you aiming for?'],
      ['Priya', "About two hundred, but we'll be happy with a hundred and fifty if people are slow to reply."],
      ['Liam', 'I will write the questions, and Priya is going to contact the student union to help us advertise it.'],
      ['Dr Hall', "Good. Remember the final report must be handed in by Friday the twelfth, and it mustn't exceed three thousand words."],
      ['Priya', 'Three thousand? I thought the limit was twenty-five hundred.'],
      ['Dr Hall', "It was last year. This year it's three thousand, including the abstract but not the references."],
      ['Liam', 'Great, that gives us more space for the discussion section.'],
      ['Dr Hall', 'One more thing. Please include some practical recommendations, for example how the cafeterias could reduce waste, rather than just describing the problem.']].map(([speaker, text]) => ({ speaker, text })),
    groups: [
      { type: 'mcq', instruction: 'Choose the correct letter, A, B or C.', qs: [
        mc('What are the students investigating?', ['A Plastic use in the cafeterias', 'B Recycling across the campus', 'C Bottled water sales'], 'A', '“single-use plastics in the cafeterias”.'),
        mc('Why did they choose a questionnaire?', ['A It is cheaper', 'B It reaches more people', 'C Interviews are hard to arrange'], 'B', '“we can reach far more people”.')
      ] },
      { type: 'fill', instruction: 'Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', qs: [
        fl('They hope to get ______ responses', '200', ['two hundred'], 'Mục tiêu 200 (150 chỉ là mức chấp nhận được).'),
        fl('Liam will write the ______', 'questions', ['question'], '“I will write the questions”.'),
        fl('Report deadline: Friday the ______', '12th', ['twelfth', '12', 'twelve'], '“Friday the twelfth”.'),
        fl('Word limit: ______ words', '3000', ['3,000', 'three thousand', '3 000'], 'Năm nay là 3000 (năm ngoái 2500 – bẫy).')
      ] }
    ]
  },
  {
    id: 'l4', topic: 'Environment', section: 4, title: 'Section 4 – Urban beekeeping', context: 'A university lecture about keeping bees in cities.',
    script: [['Lecturer', "Today I'd like to talk about urban beekeeping, which has grown remarkably in many cities over the past decade. In London, for example, the number of registered hives has roughly doubled in the last ten years, and similar trends can be seen in New York and Paris."],
      ['Lecturer', "You might assume that the countryside would be better for bees, but in fact city bees often do better. Urban areas are slightly warmer, which lengthens the season in which bees can fly, and gardens, parks and balconies provide a much wider variety of flowering plants than a field of a single crop. As a result, an urban hive can produce up to twice as much honey as a rural one."],
      ['Lecturer', "Bees will typically forage within a radius of about three kilometres, so even a rooftop hive can draw on a large area. However, there is a downside. Researchers have found that when too many honeybees are kept in one area, they compete with wild pollinators such as bumblebees and hoverflies for the same food, and some wild species decline."],
      ['Lecturer', "This has led some conservationists to argue that cities should concentrate on protecting wild pollinators rather than adding hives. My own view is that the answer is not fewer hives but more flowers. If every household planted a few native flowers on a balcony or in a window box, there would be enough for everyone."]].map(([speaker, text]) => ({ speaker, text })),
    groups: [
      { type: 'fill', instruction: 'Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', qs: [
        fl('In London the number of hives has doubled in ______ years', '10', ['ten'], '“doubled in the last ten years”.'),
        fl('Bees usually forage within ______ kilometres', '3', ['three'], '“a radius of about three kilometres”.'),
        fl('Too many honeybees compete with wild ______', 'pollinators', ['pollinator'], '“compete with wild pollinators”.'),
        fl('The speaker thinks people should plant native ______', 'flowers', ['flower'], '“more flowers … native flowers”.')
      ] },
      { type: 'mcq', instruction: 'Choose the correct letter, A, B or C.', qs: [
        mc('Why do urban bees often do well?', ['A Cities have fewer predators', 'B Cities are warmer and have more varied plants', 'C Cities have more beekeepers'], 'B', '“slightly warmer … wider variety of flowering plants”.'),
        mc('What do some conservationists argue?', ['A Hives should be banned', 'B Cities should concentrate on protecting wild pollinators', 'C Honey production should increase'], 'B', '“cities should concentrate on protecting wild pollinators”.')
      ] }
    ]
  }
];

/* ================= WRITING ================= */
const WRITING_T2 = {
  Environment: ['Some people believe that individuals can do little to improve the environment and that only governments and large companies can make a difference.\nTo what extent do you agree or disagree?'],
  Education: ['Some people think that university students should study only subjects that are directly related to their future jobs. Others believe a broad education is more valuable.\nDiscuss both views and give your own opinion.'],
  Technology: ['Many people now rely on technology for tasks that humans once did themselves.\nWhat are the advantages and disadvantages of this trend?'],
  Health: ['In many countries the amount of time people spend sitting down has increased dramatically.\nWhat problems does this cause, and what measures could be taken to reduce them?'],
  Society: ['The gap between the rich and the poor is growing in many societies.\nWhat are the causes of this, and what solutions can you suggest?'],
  Work: ['Some people prefer to work from home, while others prefer to work in an office.\nDiscuss both views and give your own opinion.'],
  Travel: ['International tourism has brought enormous benefits to many places, but it has also caused problems.\nDo the advantages of tourism outweigh the disadvantages?'],
  Hometown: ['More and more people are moving from rural areas to cities.\nIs this a positive or negative development?']
};
const WRITING_T1 = [
  { topic: 'Technology', prompt: 'The graph below shows the percentage of households with internet access in three countries between 2000 and 2020.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.', chart: { type: 'line', title: 'Households with internet access', unit: '%', labels: ['2000', '2005', '2010', '2015', '2020'], series: [{ name: 'Country A', values: [10, 35, 60, 80, 92] }, { name: 'Country B', values: [5, 20, 45, 70, 85] }, { name: 'Country C', values: [2, 10, 25, 50, 75] }] } },
  { topic: 'Society', prompt: 'The chart below shows the average number of hours per week that teenagers spent on three leisure activities in 2010 and 2020.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.', chart: { type: 'bar', title: 'Weekly leisure time of teenagers', unit: 'hours', labels: ['Watching TV', 'Social media', 'Sport'], series: [{ name: '2010', values: [14, 6, 9] }, { name: '2020', values: [8, 16, 7] }] } },
  { topic: 'Environment', prompt: 'The table below shows the sources of electricity in one country in 1990, 2005 and 2020.\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.', chart: { type: 'table', title: 'Sources of electricity', unit: '%', labels: ['1990', '2005', '2020'], series: [{ name: 'Coal', values: [60, 45, 20] }, { name: 'Gas', values: [20, 30, 35] }, { name: 'Renewables', values: [5, 10, 35] }, { name: 'Nuclear', values: [15, 15, 10] }] } }
];

/* ================= SPEAKING ================= */
const SPEAK_BANK = {
  Environment: {
    p1: ['Do you think the environment is an important issue in your country?', 'What do you do at home to protect the environment?', 'Is there much pollution in the area where you live?', 'Do you prefer spending time in nature or in the city? Why?', 'Have you ever taken part in an environmental activity?', 'Would you say you live in an eco-friendly way?'],
    p2: [{ topic: 'Describe a place in nature that you enjoyed visiting.', points: ['where it is', 'when you went there', 'what you did there', 'and explain why you enjoyed it'] }, { topic: 'Describe something you do to help the environment.', points: ['what you do', 'how often you do it', 'why you started doing it', 'and explain how it helps the environment'] }],
    p3: ['What are the biggest environmental problems in your country today?', 'Do you think individuals or governments should take more responsibility for protecting the environment?', 'How can schools teach children to care about nature?', 'Should companies that pollute be punished more heavily? Why?', 'Do you think technology will solve environmental problems in the future?']
  },
  Education: {
    p1: ['What subject(s) did you study at school or university?', 'Did you enjoy your school days?', 'Do you prefer studying alone or with others?', 'How do you usually prepare for exams?', 'Would you like to study abroad?', 'What was your favourite teacher like?'],
    p2: [{ topic: 'Describe a teacher who has influenced you.', points: ['who this person is', 'what subject he or she taught', 'what he or she was like', 'and explain why this teacher influenced you'] }, { topic: 'Describe a skill you learned that has been useful to you.', points: ['what the skill is', 'how you learned it', 'how long it took', 'and explain why it has been useful'] }],
    p3: ['How has education changed in your country over the past few decades?', 'Is it better to study online or in a classroom?', 'Should university education be free for everyone?', 'What qualities make a good teacher?', 'Do you think exams are the best way to measure ability?']
  },
  Technology: {
    p1: ['How often do you use the internet?', 'What technology do you use the most in your daily life?', 'Do you enjoy using social media?', 'Have you ever had problems with technology?', 'Do you prefer reading on paper or on a screen?', 'How did you learn to use computers?'],
    p2: [{ topic: 'Describe a piece of technology that you find useful.', points: ['what it is', 'how long you have had it', 'what you use it for', 'and explain why it is useful to you'] }, { topic: 'Describe an app or website that you use often.', points: ['what it is', 'how you found it', 'what you use it for', 'and explain why you like it'] }],
    p3: ['How has technology changed the way people communicate?', 'Do you think people depend too much on technology?', 'Will robots and artificial intelligence replace many jobs in the future?', 'Should children have limits on their screen time?', 'What are the risks of sharing personal information online?']
  },
  Health: {
    p1: ['Do you do any exercise regularly?', 'Do you think you eat a healthy diet?', 'How do you relax after a busy day?', 'Do you often go to the doctor?', 'Is sleep important to you?', 'What sports are popular in your country?'],
    p2: [{ topic: 'Describe a time when you were ill.', points: ['when it happened', 'what was wrong', 'how you recovered', 'and explain how you felt about it'] }, { topic: 'Describe a person you know who is very healthy.', points: ['who this person is', 'how you know them', 'what they do to stay healthy', 'and explain what you can learn from them'] }],
    p3: ['Why do some people find it hard to stay healthy?', 'Should the government do more to promote healthy lifestyles?', 'How does stress affect people’s health?', 'Is health care the responsibility of the state or of individuals?', 'Why are lifestyle diseases becoming more common?']
  },
  Society: {
    p1: ['Do you know many people in your neighbourhood?', 'How do people in your country celebrate festivals?', 'Do you like living in a big city?', 'Are you a member of any group or club?', 'How important is family to you?', 'What do you do to help others?'],
    p2: [{ topic: 'Describe a festival or tradition in your country.', points: ['what it is', 'when it takes place', 'what people do', 'and explain why it is important'] }, { topic: 'Describe a time when you helped someone.', points: ['who you helped', 'what you did', 'why they needed help', 'and explain how you felt afterwards'] }],
    p3: ['How has family life changed in recent years?', 'What are the main causes of inequality in society?', 'Do you think people are less friendly in big cities?', 'Should the government support elderly people more?', 'How can communities reduce crime?']
  },
  Work: {
    p1: ['Do you work or are you a student?', 'What do you like most about your job or studies?', 'Would you prefer to work for a big company or a small one?', 'What job did you want to do as a child?', 'Do you prefer working alone or in a team?', 'How do you get to work or school?'],
    p2: [{ topic: 'Describe a job you would like to do in the future.', points: ['what the job is', 'what skills you need', 'how you would prepare for it', 'and explain why you would like to do it'] }, { topic: 'Describe a time when you worked in a team.', points: ['when it was', 'who was in the team', 'what you did together', 'and explain how you felt about working as a team'] }],
    p3: ['What makes a job satisfying?', 'Is job security more important than a high salary?', 'How will working life change in the next twenty years?', 'Do you think remote work is better than office work?', 'Why do some people change careers?']
  },
  Travel: {
    p1: ['Do you like travelling?', 'What was the last place you visited?', 'Do you prefer travelling alone or with others?', 'What kind of transport do you usually use?', 'Is there a place you would like to visit again?', 'Do you take many photos when you travel?'],
    p2: [{ topic: 'Describe a memorable trip you took.', points: ['where you went', 'who you went with', 'what you did there', 'and explain why it was memorable'] }, { topic: 'Describe a place you would like to visit in the future.', points: ['where it is', 'how you know about it', 'what you would do there', 'and explain why you want to go'] }],
    p3: ['How has tourism changed in your country?', 'What are the negative effects of mass tourism?', 'Is travelling the best way to learn about other cultures?', 'Will people travel less in the future because of technology?', 'Should tourists be required to respect local customs?']
  },
  Hometown: {
    p1: ['Where is your hometown?', 'What do you like most about your hometown?', 'Has your hometown changed much?', 'Is it a good place for young people?', 'Would you like to live there in the future?', 'What is the most popular food there?'],
    p2: [{ topic: 'Describe a place in your town where people go to relax.', points: ['where it is', 'what it looks like', 'what people do there', 'and explain why it is popular'] }, { topic: 'Describe an old building in your city or town.', points: ['where it is', 'what it looks like', 'what it was used for', 'and explain why it is important'] }],
    p3: ['Why do many young people move from small towns to big cities?', 'What are the advantages of living in a small town?', 'How can a city be made more attractive for visitors?', 'Do you think historical buildings should be preserved?', 'How might cities change in the future?']
  }
};
