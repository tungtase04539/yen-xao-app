export interface Review {
  id: string;
  name: string;
  rating: number;
  content: string;
  date: string;
  reply?: string;
}

export const SEEDED_REVIEWS: Record<string, Review[]> = {
  'yen-duong-phen-30': [
    {
      id: 'ydp-1',
      name: 'Mẹ Bảo Nam',
      rating: 5,
      content: 'Yến chưng ngọt thanh rất dễ uống, mình mua cho bé nhà mình ăn để tăng đề kháng. Trộm vía bé rất hợp tác, đòi ăn suốt. Sợi yến đặc dai ngon chứ không bị loãng nước như mấy loại mua ở siêu thị.',
      date: '2026-05-12',
      reply: 'Dạ QiQi Yến Sào cảm ơn mẹ Bảo Nam đã tin dùng sản phẩm ạ. Chúc bé luôn khỏe mạnh và hay ăn chóng lớn nha mẹ!'
    },
    {
      id: 'ydp-2',
      name: 'Nguyễn Thu Trang',
      rating: 5,
      content: 'Đóng gói cẩn thận, bọc chống sốc kỹ càng. Giao hàng ở Hà Nội siêu nhanh tầm hơn 1 tiếng là nhận được rồi. Yến chưng đường phèn chuẩn vị truyền thống, ăn mát và thanh cổ họng.',
      date: '2026-05-20',
      reply: 'Cảm ơn bạn Thu Trang đã dành thời gian đánh giá. Rất vui vì bạn hài lòng với chất lượng dịch vụ của QiQi Yến Sào!'
    },
    {
      id: 'ydp-3',
      name: 'Bác Hùng Hải Phòng',
      rating: 5,
      content: 'Tôi mua lốc yến đường phèn này về cho bà nhà bồi bổ sau đợt ốm. Yến chuẩn 2g khô nên chưng lên rất đặc, sợi yến dài ăn giòn dai sần sật. Bà nhà ăn vài hũ thấy tỉnh táo và ăn ngon ngủ ngon hơn.',
      date: '2026-05-28',
      reply: 'Cháu cảm ơn bác Hùng nhiều ạ. Chúc hai bác luôn dồi dào sức khỏe và bình an!'
    },
    {
      id: 'ydp-4',
      name: 'Thùy Linh',
      rating: 4,
      content: 'Yến ngon, nhiều sợi, ngọt vừa phải ko bị gắt. Điểm trừ duy nhất là shipper giao hàng hơi muộn chút, nhưng bù lại đóng gói rất chắc chắn.',
      date: '2026-06-02',
      reply: 'QiQi Yến Sào xin lỗi bạn vì sự bất tiện của đơn vị vận chuyển ạ. Shop sẽ làm việc lại với bên ship để giao nhanh hơn. Cảm ơn phản hồi của bạn!'
    }
  ],
  'yen-hu-dong-trung-30': [
    {
      id: 'ydt-1',
      name: 'Hồng Hạnh',
      rating: 5,
      content: 'Yến đông trùng hạ thảo này ngon lắm nha mọi người. Hũ yến có sợi đông trùng nhìn rất chất lượng, chưng sệt sệt đặc yến. Mua biếu bố mẹ chồng ai cũng khen.',
      date: '2026-05-10',
      reply: 'Cảm ơn chị Hạnh đã lựa chọn QiQi Yến làm quà tặng cho gia đình. Chúc gia đình mình luôn mạnh khỏe ạ!'
    },
    {
      id: 'ydt-2',
      name: 'Văn Lâm',
      rating: 5,
      content: 'Mình hay mang hũ yến này đi làm ăn xế chiều bồi bổ sức khỏe. Vị ngọt nhẹ, sợi yến dai giòn, kết hợp đông trùng rất thơm. Ăn xong thấy người khỏe khoắn làm việc hiệu quả hẳn.',
      date: '2026-05-22',
      reply: 'Cảm ơn anh Lâm đã tin tưởng lựa chọn QiQi Yến Sào làm bạn đồng hành mỗi ngày ạ!'
    },
    {
      id: 'ydt-3',
      name: 'Bác Sơn (Hà Nội)',
      rating: 5,
      content: 'Sản phẩm tốt, tem mác đầy đủ rõ ràng. Mở nắp ra thơm mùi đông trùng tự nhiên, vị ngọt thanh mát rất dễ chịu. Đáng tiền mua.',
      date: '2026-06-01',
      reply: 'Dạ cháu cảm ơn bác Sơn đã đánh giá sản phẩm 5 sao ạ!'
    }
  ],
  'yen-duong-kieng-30': [
    {
      id: 'ydk-1',
      name: 'Thanh Vân',
      rating: 5,
      content: 'Tìm mãi mới thấy dòng yến chưng đường kiêng ngon thế này. Mình đang bầu bị tiểu đường thai kỳ nên kiêng ngọt ngặt nghèo, ăn hũ yến này dùng đường isomalt thấy an tâm hẳn, vị thanh mát cực kỳ.',
      date: '2026-05-14',
      reply: 'Cảm ơn mẹ bầu Thanh Vân đã tin tưởng. Chúc mẹ và bé có một thai kỳ khỏe mạnh, bình an nha!'
    },
    {
      id: 'ydk-2',
      name: 'Minh Anh',
      rating: 5,
      content: 'Mua tặng bà ngoại bị cao huyết áp với tiểu đường. Bà khen ngọt thanh thanh dễ ăn mà không sợ tăng đường huyết. Đóng gói hộp đỏ sang trọng làm quà rất lịch sự.',
      date: '2026-05-25',
      reply: 'Dạ QiQi Yến rất vui vì món quà của bạn mang lại niềm vui cho bà ngoại ạ. Cảm ơn bạn nhiều!'
    },
    {
      id: 'ydk-3',
      name: 'Nguyễn Thành',
      rating: 4,
      content: 'Yến chưng đặc, ăn cảm nhận rõ sợi yến thật. Vị ngọt dịu nhẹ vì là đường kiêng. Giao hàng nhanh bọc chống sốc kỹ.',
      date: '2026-06-03',
      reply: 'Cảm ơn anh Thành đã phản hồi tốt về sản phẩm. Rất mong được tiếp tục phục vụ anh ạ!'
    }
  ],
  'yen-sam-dong-trung': [
    {
      id: 'ysdt-1',
      name: 'Anh Tuấn',
      rating: 5,
      content: 'Yến kết hợp cả nhân sâm và đông trùng hạ thảo uống cực kỳ bổ. Uống vào thấy tỉnh táo, giảm mệt mỏi sau ngày dài làm việc căng thẳng. Mùi nhân sâm thơm nhẹ rất đặc trưng.',
      date: '2026-05-15',
      reply: 'Cảm ơn anh Tuấn đã tin dùng dòng sản phẩm cao cấp yến sâm đông trùng của QiQi Yến Sào!'
    },
    {
      id: 'ysdt-2',
      name: 'Cô Mai (Hải Phòng)',
      rating: 5,
      content: 'Tôi mua lốc này về uống thấy ngủ ngon và sâu giấc hẳn. Trước hay bị mất ngủ đêm, giờ tối nào cũng ăn 1 hũ yến sâm thấy người khỏe mạnh, da dẻ hồng hào lên.',
      date: '2026-05-27',
      reply: 'Dạ cháu cảm ơn cô Mai nhiều ạ. Chúc cô luôn trẻ khỏe và tràn đầy năng lượng!'
    }
  ],
  'yen-sam-dong-trung-duong-kieng': [
    {
      id: 'ysdk-1',
      name: 'Lê Hoàng',
      rating: 5,
      content: 'Sản phẩm tuyệt vời cho người già bị tiểu đường. Mua cho ông nội dùng bồi bổ sau ốm, ông khen sâm thơm, yến dai sần sật, ngọt dịu từ đường ăn kiêng củ cải Đức nên rất an toàn.',
      date: '2026-05-18',
      reply: 'Dạ cháu cảm ơn anh Hoàng đã mua quà bồi bổ cho ông ạ. Chúc ông nội mau chóng bình phục và mạnh khỏe!'
    },
    {
      id: 'ysdk-2',
      name: 'Chị Huệ',
      rating: 5,
      content: 'Giao hàng nhanh, tư vấn nhiệt tình. Dòng yến chưng sâm đường kiêng này rất hợp với chế độ ăn kiêng giảm cân của mình mà vẫn đủ chất dinh dưỡng. Sẽ mua lại.',
      date: '2026-06-02',
      reply: 'Cảm ơn chị Huệ đã ủng hộ shop. Chúc chị giữ vững vóc dáng và luôn rạng rỡ nha!'
    }
  ],
  'set-6-hu-yen-sam-dong-trung': [
    {
      id: 's6s-1',
      name: 'Trần Quốc Bảo',
      rating: 5,
      content: 'Hộp quà cực kỳ sang trọng, tông màu đỏ vàng nhìn rất cao cấp và ấm cúng. Mang đi biếu đối tác dịp lễ vừa lịch sự vừa ý nghĩa. Hộp đóng gói chắc chắn, chai thủy tinh dày dặn.',
      date: '2026-05-11',
      reply: 'Cảm ơn anh Bảo đã tin tưởng lựa chọn QiQi Yến làm quà tặng đối tác ạ!'
    },
    {
      id: 's6s-2',
      name: 'Ngọc Trâm',
      rating: 5,
      content: 'Set 6 hũ này bọc túi xách rất đẹp. Yến bên trong đặc và thơm mùi nhân sâm đông trùng. Ông bà nhận được quà thích lắm. Giá cả tương xứng với chất lượng sang xịn mịn.',
      date: '2026-05-24',
      reply: 'Dạ QiQi Yến rất hạnh phúc khi nhận được phản hồi của chị Trâm. Cảm ơn chị nhiều!'
    }
  ],
  'set-10-hu-yen-dong-trung': [
    {
      id: 's10d-1',
      name: 'Hoàng Yến',
      rating: 5,
      content: 'Mua set 10 hũ về cho cả gia đình dùng dần tiết kiệm hơn mua lẻ nhiều. Yến đông trùng chưng sẵn đặc sợi yến, ngọt thanh dễ ăn. Trẻ nhỏ và người lớn đều thích.',
      date: '2026-05-15',
      reply: 'Cảm ơn chị Yến đã ủng hộ set 10 hũ của shop. Chúc cả gia đình mình luôn khỏe mạnh nha!'
    },
    {
      id: 's10d-2',
      name: 'Mạnh Cường',
      rating: 5,
      content: 'Đã nhận đủ 10 hũ yến, đóng gói thùng xốp chống va đập cực tốt, không bị sứt mẻ hũ nào. Yến chưng đặc, đông trùng thơm lừng. Rất hài lòng.',
      date: '2026-05-28',
      reply: 'Cảm ơn anh Cường đã đánh giá. Sự hài lòng của anh là động lực lớn cho QiQi Yến Sào!'
    }
  ],
  'set-10-hu-yen-duong-phen': [
    {
      id: 's10p-1',
      name: 'Chị Mai Lan',
      rating: 5,
      content: 'Yến đường phèn vị truyền thống dễ ăn nhất, bé nhà mình ngày nào đi học về cũng đòi ăn 1 hũ. Set 10 hũ giá rất tốt, tính ra kinh tế hơn hẳn. Shop phục vụ siêu nhiệt tình.',
      date: '2026-05-17',
      reply: 'Dạ cảm ơn chị Lan nhiều ạ. Chúc bé con học giỏi và luôn ngoan ngoãn khỏe mạnh nha!'
    },
    {
      id: 's10p-2',
      name: 'Phương Thảo',
      rating: 5,
      content: 'Sản phẩm yến của QiQi chưng sẵn rất tiện lợi, sợi yến dài dai chứ ko phải vụn nát. Vị ngọt phèn thanh thanh dễ chịu. Đã mua đi mua lại nhiều lần.',
      date: '2026-05-30',
      reply: 'Cảm ơn bạn Phương Thảo đã luôn đồng hành cùng QiQi Yến Sào!'
    }
  ],
  'set-10-hu-yen-duong-kieng': [
    {
      id: 's10k-1',
      name: 'Anh Vũ',
      rating: 5,
      content: 'Mua cho bố mẹ ăn kiêng ngọt. Set 10 hũ đóng gói chỉn chu, yến chất lượng, nhiều sợi. Bố mẹ ăn thấy đỡ mất ngủ ban đêm, sức khỏe cải thiện rõ rệt.',
      date: '2026-05-16',
      reply: 'Dạ cháu cảm ơn anh Vũ nhiều ạ. Chúc hai bác luôn dồi dào sức khỏe, sống vui cùng con cháu!'
    },
    {
      id: 's10k-2',
      name: 'Ngọc Diệp',
      rating: 5,
      content: 'Đường kiêng ngọt thanh mát rượi, ăn mát dạ cực kỳ. Mình ăn giảm cân mà vẫn muốn bồi bổ cơ thể nên chọn set này là chuẩn bài luôn. 5 sao cho chất lượng.',
      date: '2026-06-02',
      reply: 'Cảm ơn bạn Diệp đã ủng hộ dòng yến đường kiêng của shop nha!'
    }
  ],
  'set-6-hu-yen-sam-dong-trung-ha-thao': [
    {
      id: 's6sd-1',
      name: 'Oanh Nguyễn',
      rating: 5,
      content: 'Hộp quà thiết kế rất đẳng cấp, sang trọng. Yến sâm đông trùng uống cực kỳ bổ dưỡng và thơm ngon. Mua tặng sếp nam rất hợp lý, sếp khen hộp đẹp và yến chất lượng.',
      date: '2026-05-21',
      reply: 'Cảm ơn chị Oanh đã tin dùng sản phẩm của QiQi Yến Sào để làm quà tặng sếp ạ!'
    },
    {
      id: 's6sd-2',
      name: 'Trần Minh Hoàng',
      rating: 5,
      content: 'Combo này mix sâm với đông trùng hạ thảo chuẩn 2g yến khô chất lượng cực kỳ. Nước yến sánh đặc, nhiều sợi dai sần sật. Shop giao hàng nhanh hỏa tốc.',
      date: '2026-05-29',
      reply: 'Cảm ơn anh Hoàng đã đánh giá tốt. Chúc anh luôn thành công và nhiều sức khỏe!'
    }
  ],
  'set-6-yen-chung-duong-phen': [
    {
      id: 's6p-1',
      name: 'Khánh Linh',
      rating: 5,
      content: 'Set 6 hũ đường phèn truyền thống xinh xắn, hộp đỏ sang trọng có túi xách đi kèm. Mua về thắp hương hoặc biếu tặng đều rất lịch sự. Giá cả hợp túi tiền.',
      date: '2026-05-14',
      reply: 'Cảm ơn bạn Linh đã lựa chọn sản phẩm của shop để chuẩn bị cho những dịp đặc biệt!'
    },
    {
      id: 's6p-2',
      name: 'Mẹ Sữa',
      rating: 5,
      content: 'Bé Sữa nhà mình mê tít vị đường phèn này của shop. Trộm vía yến chưng sạch sẽ, sợi dai mềm dễ nuốt, vị ngọt dịu chứ không gắt đường hóa học. Rất an tâm cho bé ăn.',
      date: '2026-05-26',
      reply: 'QiQi Yến Sào cảm ơn mẹ Sữa. Chúc bé Sữa luôn ngoan ngoãn và khỏe mạnh nha!'
    }
  ],
  'set-6-yen-chung-dong-trung-ha-thao': [
    {
      id: 's6dt-1',
      name: 'Hoàng Nam',
      rating: 5,
      content: 'Sản phẩm tốt, đóng gói rất cẩn thận bọc xốp nổ xung quanh hộp quà không bị móp méo chút nào. Yến chưng đông trùng ăn sần sật rất ngon và bổ dưỡng.',
      date: '2026-05-19',
      reply: 'Cảm ơn anh Nam đã dành lời khen cho chất lượng đóng gói và sản phẩm của shop!'
    },
    {
      id: 's6dt-2',
      name: 'Chị Mai Anh',
      rating: 5,
      content: 'Set 6 hũ này rất tiện làm quà biếu bà nội. Yến đặc sợi, dễ ăn, giúp bà ngủ ngon và sâu giấc hơn. Giao hàng hỏa tốc trong ngày quá nhanh gọn.',
      date: '2026-06-01',
      reply: 'Dạ shop cảm ơn chị Mai Anh ạ. Chúc bà nội luôn mạnh khỏe và vui vẻ bên con cháu!'
    }
  ],
  'yen-tho': [
    {
      id: 'yt-1',
      name: 'Cô Phương (Hà Nội)',
      rating: 5,
      content: 'Tổ yến thô chuẩn khánh hòa, ít lông và tạp chất, nhặt lông rất nhanh. Khi chưng lên nở nhiều cực kỳ, sợi yến dai nguyên bản và thơm mùi tanh tự nhiên đặc trưng của yến thật.',
      date: '2026-05-12',
      reply: 'Dạ cháu cảm ơn cô Phương đã tin dùng tổ yến thô của QiQi Yến Sào ạ!'
    },
    {
      id: 'yt-2',
      name: 'Quỳnh Chi',
      rating: 5,
      content: 'Yến thô của shop tai tổ to, dày dặn và khô giòn. Mình chưng cho cả nhà ăn ai cũng khen yến nở nhiều và dai sần sật. Shop tặng kèm đường phèn, táo đỏ rất chu đáo.',
      date: '2026-05-24',
      reply: 'Cảm ơn Quỳnh Chi đã đánh giá. Chúc cả nhà mình luôn khỏe mạnh và thưởng thức yến ngon miệng nha!'
    },
    {
      id: 'yt-3',
      name: 'Bác Hùng',
      rating: 4,
      content: 'Yến tổ chuẩn, chưng thơm ngon nở tốt. Tuy nhiên nhặt lông hơi mất thời gian chút nhưng bù lại ăn yến thô tự tay làm thấy an tâm và chất lượng nhất.',
      date: '2026-06-03',
      reply: 'Dạ yến thô nguyên bản chưa qua sơ chế nên sẽ tốn chút thời gian làm sạch ạ. Lần sau bác có thể tham khảo dòng tinh chế hoặc rút lông nước tiện lợi hơn của shop nha bác!'
    }
  ],
  'yen-tinh-che': [
    {
      id: 'ytc-1',
      name: 'Chị Thanh Thuỷ',
      rating: 5,
      content: 'Yến tinh chế sạch sẽ hoàn toàn lông, về chỉ việc ngâm 20 phút rồi chưng rất nhàn. Sợi yến chưng dai giòn không bị nhão vụn, nở nhiều. Hộp quà tặng kèm nhíp và táo đỏ hạt sen xịn xò.',
      date: '2026-05-11',
      reply: 'Cảm ơn chị Thuỷ đã ủng hộ yến tinh chế của shop. Chúc chị luôn xinh đẹp và nhiều sức khỏe!'
    },
    {
      id: 'ytc-2',
      name: 'Mẹ Bon',
      rating: 5,
      content: 'Yến sạch sẽ cực kỳ, chưng lên thơm lừng mùi yến thật. Mình mua chưng cho bé Bon ăn dặm bồi bổ đề kháng rất tiện, không mất công nhặt lông vất vả. Giá hợp lý so với thị trường.',
      date: '2026-05-25',
      reply: 'QiQi Yến Sào cảm ơn mẹ Bon. Chúc bé Bon ăn ngoan, ngủ ngoan và khỏe mạnh nha!'
    },
    {
      id: 'ytc-3',
      name: 'Anh Tuấn Anh',
      rating: 5,
      content: 'Tổ yến ép khuôn đẹp, sợi nhiều chứ ko bị độn vụn xơ mướp ở mặt dưới. Đã chưng thử ăn rất dai ngon sần sật. Hộp đựng sang trọng thích hợp đem tặng đối tác.',
      date: '2026-06-02',
      reply: 'Cảm ơn phản hồi chi tiết của anh Tuấn Anh. Rất vui vì anh hài lòng với sản phẩm!'
    }
  ],
  'hoang-yen-dong-trung': [
    {
      id: 'hydt-1',
      name: 'Nguyễn Thị Mai',
      rating: 5,
      content: 'Dòng Hoàng Yến Đông Trùng này chưng sẵn cực kỳ cao cấp. Hũ yến to đặc sánh, sợi yến nhiều và có cả sợi đông trùng hạ thảo màu vàng óng. Uống vào thấy mát ruột và khỏe khoắn hẳn.',
      date: '2026-05-16',
      reply: 'Cảm ơn chị Mai đã tin dùng dòng sản phẩm cao cấp Hoàng Yến Đông Trùng của QiQi Yến Sào!'
    },
    {
      id: 'hydt-2',
      name: 'Bác Quốc',
      rating: 5,
      content: 'Sản phẩm bổ dưỡng, hộp quà sang trọng quý phái phù hợp mang tặng người lớn tuổi. Yến ngọt thanh, đông trùng hạ thảo thơm bồi bổ sức khỏe rất tốt cho tuổi già chúng tôi.',
      date: '2026-05-28',
      reply: 'Dạ cháu cảm ơn bác Quốc nhiều ạ. Chúc bác luôn khỏe mạnh, vui vẻ và bình an!'
    }
  ],
  'yen-rut-long-nuoc': [
    {
      id: 'yrln-1',
      name: 'Chị Hương Giang',
      rating: 5,
      content: 'Tổ yến rút lông nước giữ nguyên hình dáng tổ, sạch lông hoàn toàn mà vẫn giữ được độ dai giòn nguyên bản của sợi yến. Chưng lên thơm tanh nhẹ rất đã, sợi yến dài ăn thích miệng lắm.',
      date: '2026-05-18',
      reply: 'Cảm ơn chị Giang đã đánh giá sản phẩm cao cấp rút lông nước của shop ạ!'
    },
    {
      id: 'yrln-2',
      name: 'Mẹ Bắp',
      rating: 5,
      content: 'Hàng chuẩn xuất khẩu, sạch sẽ không một cọng lông tơ. Tiết kiệm thời gian nhặt lông tối đa mà giữ được nguyên vẹn chất dinh dưỡng. Chưng lên nở rất nhiều, cực kỳ chất lượng.',
      date: '2026-05-30',
      reply: 'QiQi Yến Sào cảm ơn mẹ Bắp. Chúc cả nhà mình luôn dồi dào sức khỏe và thưởng thức yến ngon miệng nha!'
    }
  ],
  'set-tinh-che-50g': [
    {
      id: 'stc50-1',
      name: 'Khánh Huyền',
      rating: 5,
      content: 'Set 50g tinh chế rất vừa vặn cho ai muốn dùng thử trước khi mua hộp lớn 100g. Tổ yến sạch lông, trắng đẹp. Shop tặng kèm táo đỏ, hạt chia và đường phèn đầy đủ để chưng.',
      date: '2026-05-15',
      reply: 'Cảm ơn bạn Huyền đã ủng hộ set 50g của shop. Hy vọng sản phẩm mang lại sức khỏe cho bạn!'
    },
    {
      id: 'stc50-2',
      name: 'Cô Lan (Thanh Xuân)',
      rating: 5,
      content: 'Yến sạch, ngâm ra sợi dài và dai chứ ko bị nhão nát. Chưng lên thơm ngon cả nhà đều khen. Giá set 50g này rất hợp lý và kinh tế.',
      date: '2026-05-27',
      reply: 'Dạ shop cảm ơn cô Lan nhiều ạ. Kính chúc cô luôn khỏe mạnh và bình an!'
    }
  ]
};

// Fallback reviews for products that don't have custom ones
const DEFAULT_REVIEWS: Review[] = [
  {
    id: 'def-1',
    name: 'Nguyễn Thị Minh',
    rating: 5,
    content: 'Sản phẩm chất lượng cao, đóng gói cực kỳ cẩn thận và giao hàng nhanh. Vị thanh nhẹ dễ uống, sợi yến dai ngon tự nhiên. Sẽ tiếp tục mua ủng hộ shop.',
    date: '2026-05-20',
    reply: 'Cảm ơn bạn đã tin dùng sản phẩm của QiQi Yến Sào ạ. Chúc bạn và gia đình thật nhiều sức khỏe!'
  },
  {
    id: 'def-2',
    name: 'Trần Văn Hoàng',
    rating: 5,
    content: 'Yến chưng sẵn đặc sợi yến, vị ngọt dịu nhẹ không bị gắt đường, ăn sần sật rất thích. Thiết kế hộp đẹp mang đi biếu làm quà tặng rất sang trọng và lịch sự.',
    date: '2026-05-29',
    reply: 'QiQi Yến Sào cảm ơn anh đã đánh giá tốt sản phẩm. Rất vui vì món quà của anh mang lại sự hài lòng!'
  },
  {
    id: 'def-3',
    name: 'Bác Hạnh (Hải Phòng)',
    rating: 4,
    content: 'Tôi mua cho gia đình dùng bồi bổ thấy rất hợp, nước yến đặc sánh, đóng gói lọ thuỷ tinh chắc chắn sạch sẽ. Phục vụ chu đáo, ship nhiệt tình.',
    date: '2026-06-03',
    reply: 'Cháu cảm ơn bác Hạnh ạ. Kính chúc bác và gia đình luôn mạnh khỏe, hạnh phúc!'
  }
];

/**
 * Get all reviews for a product (combining seeded reviews and localStorage reviews)
 */
export function getProductReviews(slug: string): Review[] {
  if (typeof window === 'undefined') {
    return SEEDED_REVIEWS[slug] || DEFAULT_REVIEWS;
  }

  // Load from localStorage if present
  try {
    const localData = localStorage.getItem(`reviews_${slug}`);
    const localReviews: Review[] = localData ? JSON.parse(localData) : [];
    const seeded = SEEDED_REVIEWS[slug] || DEFAULT_REVIEWS;
    return [...localReviews, ...seeded];
  } catch (e) {
    console.error('Error loading reviews from localStorage', e);
    return SEEDED_REVIEWS[slug] || DEFAULT_REVIEWS;
  }
}

/**
 * Get average rating and total review count for a product
 */
export function getProductRatingSummary(slug: string) {
  const reviews = getProductReviews(slug);
  if (reviews.length === 0) {
    return { rating: 5.0, count: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const rating = parseFloat((sum / reviews.length).toFixed(1));
  return { rating, count: reviews.length };
}

/**
 * Add a review to localStorage
 */
export function addProductReview(slug: string, name: string, rating: number, content: string): Review {
  const newReview: Review = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    rating,
    content,
    date: new Date().toISOString().split('T')[0],
  };

  if (typeof window !== 'undefined') {
    try {
      const localData = localStorage.getItem(`reviews_${slug}`);
      const localReviews: Review[] = localData ? JSON.parse(localData) : [];
      localReviews.unshift(newReview); // Add to the beginning of local reviews
      localStorage.setItem(`reviews_${slug}`, JSON.stringify(localReviews));
    } catch (e) {
      console.error('Error saving review to localStorage', e);
    }
  }

  return newReview;
}
