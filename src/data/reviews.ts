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
      reply: 'Cảm ơn anh Cường đã đánh giá. Sự hài lòng của anh là động lực lớn nhất của QiQi Yến Sào!'
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

// pools for review generation
const FIRST_NAMES = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const MIDDLE_NAMES = ['Thị', 'Văn', 'Minh', 'Thu', 'Hồng', 'Ngọc', 'Thanh', 'Đức', 'Hoài', 'Xuân', 'Kim', 'Khánh', 'Quốc', 'Anh'];
const LAST_NAMES = ['Trang', 'Hương', 'Hạnh', 'Linh', 'Thảo', 'Vân', 'Anh', 'Tú', 'Lâm', 'Sơn', 'Tùng', 'Hùng', 'Cường', 'Nam', 'Hoàng', 'Bảo', 'Trâm', 'Yến', 'Lan', 'Vũ', 'Diệp', 'Oanh', 'Chi', 'Phương', 'Huyền', 'Mai', 'Giang', 'Huệ', 'Tú', 'Trà', 'My', 'Hà', 'Duy', 'Bình', 'Tuyết'];
const TITLES = ['Chị', 'Anh', 'Mẹ', 'Bác', 'Cô', 'Bạn', 'Bà', 'Ông', 'Mẹ bầu', 'Em'];

const openingPhrases = [
  'Đã nhận được hàng, đóng gói rất cẩn thận bọc chống sốc kỹ càng.',
  'Giao hàng nhanh cực kỳ, đóng gói hộp đỏ rất đẹp và sang trọng.',
  'Sản phẩm đóng gói đẹp mắt, bọc chống sốc từng lọ thủy tinh chắc chắn.',
  'Mua của shop nhiều lần rồi, lúc nào giao hàng cũng nhanh và đóng gói kỹ.',
  'Nhận hàng nguyên vẹn không sứt mẻ hũ nào, shop đóng gói cẩn thận lắm.',
  'Giao hỏa tốc siêu nhanh, bọc chống va đập tốt.',
  'Đóng hộp đỏ sang xịn mịn, đem đi biếu tặng rất lịch sự và đẳng cấp.',
  'Ấn tượng đầu tiên là đóng gói siêu chắc chắn và giao hàng siêu tốc.',
  'Hộp quà đẹp lắm nha mọi người, có túi xách đi kèm lịch sự.',
  'Hàng chuẩn chính hãng, tem mác niêm phong đầy đủ rõ ràng.',
  'Giao hàng nhanh, đóng gói kỹ lưỡng, vỏ hộp đẹp.',
  'Nhận hàng rất ưng ý, shop đóng gói cẩn thận bằng hộp xốp bọc kỹ.',
  'Đóng gói quá chuyên nghiệp, không sứt mẻ chai nào.',
  'Đã nhận đủ hàng, mẫu mã sang trọng đúng như quảng cáo.',
  'Giao hàng nhanh chóng, bọc xốp nổ dày dặn cực an tâm.'
];

const generalQualityPhrases = [
  'Yến chưng đặc sánh, nhiều sợi yến dai ngon sần sật chứ không bị loãng.',
  'Mở nắp ra là thơm mùi yến tự nhiên, yến dạng sệt ăn rất chất lượng.',
  'Nước yến ngọt thanh thanh dễ uống, sợi yến nhiều ăn ngập miệng.',
  'Yến thật chuẩn 2g khô nên chưng lên rất đặc, không bị pha trộn chất tạo sệt.',
  'Sợi yến giòn dai sần sật ăn đã miệng lắm, không bị vụn nát như loại khác.',
  'Sản phẩm chất lượng tốt, yến đặc nhiều sợi, độ ngọt thanh mát vừa vặn.',
  'Hũ yến dày dặn sạch sẽ, yến chưng thơm mát dễ chịu cực kỳ.',
  'Yến đặc sệt ăn rất chất lượng chứ ko lỏng bỏng nước như các hãng khác.',
  'Hương vị thơm ngon tự nhiên, sợi yến dai giòn đúng chuẩn nguyên chất.',
  'Yến đặc nhiều, vị thanh ngọt mát họng rất dễ chịu.',
  'Ăn thử thấy sợi yến dai sần sật giòn ngon, ngọt phèn dịu nhẹ.',
  'Mở nắp ra thấy yến đặc sánh ngập hũ, rất đáng đồng tiền bát gạo.',
  'Sợi yến to dài, không bị nát, ăn thơm ngon bổ dưỡng.',
  'Hũ yến chưng sánh đặc, đầy đặn sợi yến thật chứ không độn mủ trôm.',
  'Vị yến thơm tanh nhẹ đặc trưng của yến thật, ăn giòn dai thanh mát.'
];

const shippingAndService = [
  'Shop tư vấn nhiệt tình, phục vụ chu đáo dã man.',
  'Nhân viên hỗ trợ nhiệt tình, giải đáp thắc mắc nhanh chóng.',
  'Shipper giao hàng lịch sự, vui vẻ, gọi trước khi giao.',
  'Dịch vụ chăm sóc khách hàng của shop rất tốt, 10 điểm.',
  'Tặng kèm đầy đủ phụ kiện, shop phục vụ chu đáo.',
  'Tư vấn nhanh chóng, nhiệt tình, đóng gói hàng giao siêu tốc.',
  'Chăm sóc khách hàng siêu có tâm, nhắn tin trả lời ngay lập tức.',
  'Shipper Hải Phòng thân thiện giao hàng siêu nhanh hỏa tốc.',
  'Rất hài lòng về cách làm việc chuyên nghiệp của shop.',
  'Hỗ trợ đổi trả nhanh chóng nếu gặp vấn đề, cực kỳ uy tín.'
];

const recommendationPhrases = [
  'Sẽ tiếp tục ủng hộ shop lâu dài vì sản phẩm chất lượng.',
  'Rất đáng tiền mua nha mọi người, nên mua bồi bổ cho gia đình.',
  'Sẽ giới thiệu cho bạn bè người thân ủng hộ shop.',
  'Đánh giá 5 sao cho chất lượng sản phẩm và dịch vụ của shop.',
  'Sản phẩm rất đáng tiền, mua làm quà biếu cực kỳ hợp lý.',
  'Chắc chắn sẽ mua lại nhiều lần nữa.',
  'Mọi người nên mua thử để trải nghiệm yến thật của shop nha.',
  'Cực kỳ hài lòng, sẽ ủng hộ shop dài dài.',
  'Sản phẩm chất lượng cao, xứng đáng nhận điểm 10.',
  'Rất ưng ý từ sản phẩm đến dịch vụ phục vụ.'
];

const sugarFreePhrases = [
  'Dòng đường kiêng này rất hợp cho người tiểu đường hoặc đang ăn kiêng giảm cân.',
  'Ngọt dịu nhẹ từ đường củ cải isomalt ăn thanh mát mà không sợ tăng đường huyết.',
  'Mua biếu ông bà bị cao huyết áp với tiểu đường, ông bà khen ngon và an tâm ăn.',
  'Vị ngọt thanh thanh nhẹ nhàng, ăn kiêng mà được bồi bổ yến sào này thì quá tuyệt.',
  'Đường ăn kiêng ngọt dịu thanh nhẹ, cực thích hợp cho chế độ healthy.',
  'Thích nhất là vị ngọt thanh tự nhiên ko bị khé cổ, mẹ bầu tiểu đường thai kỳ ăn siêu an tâm.',
  'Mua biếu bố mẹ bị tiểu đường hũ này bố mẹ ưng lắm, đỡ mất công tự chưng.',
  'Vị ngọt dịu nhẹ nhàng, ăn ngon mát họng mà ko sợ béo.'
];

const cordycepsPhrases = [
  'Sợi đông trùng hạ thảo dai dai thơm nhẹ, chưng cùng yến bổ dưỡng nhân đôi.',
  'Uống vào thấy người khỏe khoắn, giảm mệt mỏi, ngủ sâu giấc hơn hẳn.',
  'Mùi vị đông trùng tự nhiên thơm lắm, sợi đông trùng nhìn chất lượng cực kỳ.',
  'Mua cho bố mẹ bồi bổ sức khỏe tuổi già, ai cũng khen vị đông trùng này thơm ngon.',
  'Màu vàng đông trùng óng ánh đẹp mắt, hũ yến đặc sệt sợi đông trùng dai sần sật.',
  'Ăn xế chiều hũ này thấy hồi phục năng lượng rất nhanh, người khỏe khoắn hẳn.',
  'Mùi thơm nhẹ của đông trùng rất dễ chịu, vị ngọt phèn thanh dịu.',
  'Bồi bổ sức khỏe cực tốt, ăn xong ngủ ngon giấc và sâu giấc hơn.'
];

const ginsengPhrases = [
  'Mùi sâm thơm lừng rất dễ chịu, kết hợp đông trùng và yến uống bổ dưỡng lắm.',
  'Uống vào thấy tỉnh táo đầu óc, tràn đầy năng lượng làm việc cả ngày.',
  'Sâm thơm nhẹ nhàng dễ ăn, sợi yến dai sần sật bồi bổ cơ thể rất nhanh.',
  'Mua cho ông nội phục hồi sau ốm, sâm bổ khí huyết giúp ông ăn ngủ ngon hơn.',
  'Sâm kết hợp đông trùng vị đậm đà rất bổ dưỡng, ông bà khen uống khỏe người.',
  'Thơm nhẹ mùi nhân sâm cao cấp, uống mát lạnh bổ khí huyết cực tốt.',
  'Yến chưng sâm uống tỉnh táo sảng khoái, giảm căng thẳng mệt mỏi công việc.',
  'Món quà sức khỏe tuyệt vời cho người già và người cần hồi phục sức khỏe.'
];

const rockSugarPhrases = [
  'Vị đường phèn truyền thống ngọt thanh mát lành dễ ăn nhất.',
  'Bé nhà mình thích vị này lắm, trộm vía bé ăn ngon miệng và tăng đề kháng.',
  'Cả nhà mình ai cũng chuộng vị đường phèn nguyên bản này, thanh mát giải nhiệt.',
  'Đường phèn chưng thơm dịu, ngọt nhẹ thanh thanh chứ không bị khé cổ.',
  'Đường phèn nguyên bản ngọt thanh dịu mát, yến nhiều sợi giòn sần sật.',
  'Vị ngọt thanh cổ họng, yến sào kết hợp đường phèn truyền thống luôn là số 1.',
  'Bé nhà mình lười ăn mà trộm vía ngày nào cũng đòi ăn 1 hũ yến đường phèn này.',
  'Yến chưng đường phèn thanh mát giải nhiệt cực tốt cho những ngày nắng nóng.'
];

const nestPhrases = [
  'Yến tổ nở nhiều dã man, chưng lên thơm mùi tanh nhẹ tự nhiên của tổ yến.',
  'Sợi yến dài dai giòn sần sật ăn sướng miệng, chưng bát yến chất lượng.',
  'Shop tặng kèm đầy đủ đường phèn, táo đỏ, hạt sen chưng ăn ngon tuyệt cú mèo.',
  'Yến sạch sẽ ít lông tơ (hoặc tinh chế ko có lông), chế biến rất nhàn.',
  'Tai yến to dày dặn khô ráo, cân đủ trọng lượng, shop làm ăn rất uy tín.',
  'Tổ yến khô giòn, ngâm nở bung rất nhiều sợi yến dài, dai ngon nguyên chất.',
  'Tinh chế sạch bong ko còn một cọng lông, chưng cực nhanh cực tiện cho mẹ bầu.',
  'Ăn yến tổ tự chưng thấy yên tâm nhất, sợi yến của shop dai nguyên bản.'
];

const shortReviews = [
  'Yến ngon, vị ngọt thanh mát, giao hàng rất nhanh.',
  'Đóng gói cẩn thận bọc chống sốc kỹ, sản phẩm đúng hình.',
  'Yến chưng rất đặc nhiều sợi dai ngon, chuẩn 5 sao.',
  'Vị ngọt vừa phải, yến sánh sệt ăn sần sật rất đã.',
  'Shop tư vấn nhiệt tình, giao hỏa tốc siêu nhanh.',
  'Mua lần thứ 3 của shop rồi, chất lượng yến luôn ổn định.',
  'Hộp quà màu đỏ rất đẹp sang trọng, biếu tặng lịch sự lắm.',
  'Yến thơm tự nhiên tanh nhẹ đặc trưng, ăn rất giòn dai.',
  'Sản phẩm tốt đáng tiền mua bồi bổ cho gia đình.',
  'Yến đặc sánh ngập hũ chứ ko loãng nước, rất ưng ý.',
  'Giao đủ số lượng, chai thủy tinh đóng nắp niêm phong cẩn thận.',
  'Yến chưng đường phèn ngọt mát dễ ăn, bé nhà mình rất thích.',
  'Hũ yến nhiều sợi sền sệt giòn dai, chất lượng tuyệt vời.',
  'Đáng đồng tiền bát gạo, shop uy tín giao hàng nhanh.',
  'Ok lắm shop ơi, lần sau sẽ ủng hộ tiếp tục.'
];

const familyReviews = [
  'Mua về cho bé con ăn dặm bồi bổ sức đề kháng, trộm vía bé ăn ngon miệng thích lắm.',
  'Yến vị đường phèn ngọt thanh dịu, bé nhà mình lười ăn mà trộm vía ăn yến này lại rất hợp tác.',
  'Bé nhà mình ăn yến đều đặn thấy da dẻ hồng hào, ít bị ốm vặt khi thay đổi thời tiết.',
  'Mua cho bà ngoại bị cao huyết áp với tiểu đường, bà khen ngọt thanh dễ ăn mà khỏe người.',
  'Bố mẹ mình lớn tuổi hay bị mất ngủ, tối nào cũng ăn 1 hũ yến sâm đông trùng thấy ngủ sâu giấc hơn.',
  'Mua bồi bổ cho ông nội sau ốm, ông ăn yến sâm thấy người khỏe khoắn đi lại hoạt bát hẳn ra.',
  'Vợ bầu nghén ăn hũ yến đường kiêng này thấy mát ruột dễ chịu, bổ dưỡng mà ko lo tăng đường huyết.',
  'Yến sánh đặc nhiều sợi, cả nhà mình ai cũng thích ăn từ trẻ nhỏ đến người già.',
  'Mua cho mẹ bầu ăn tẩm bổ thai kỳ, trộm vía đi khám bác sĩ khen mẹ khỏe bé phát triển tốt.',
  'Sản phẩm bổ dưỡng tuyệt vời, cả gia đình mình đều dùng mỗi ngày để tăng sức đề kháng.'
];

const giftReviews = [
  'Hộp quà tông đỏ mạ vàng cực kỳ sang trọng ấm cúng, mang đi biếu Tết đối tác rất lịch sự.',
  'Set 6 hũ yến sâm đông trùng thiết kế hộp rất đẳng cấp sành điệu, mang tặng sếp cực chuẩn bài.',
  'Túi xách đi kèm trang nhã lịch thiệp, chai thủy tinh dày dặn bọc chống sốc kỹ càng biếu tặng rất sang.',
  'Mua set 10 hũ về chia quà biếu ông bà nội ngoại hai bên ai cũng khen yến đặc và hộp quà đẹp.',
  'Hộp thiết kế rất tinh tế cao cấp, giá cả lại phải chăng tương xứng chất lượng quà tặng.',
  'Món quà sức khỏe ý nghĩa nhất dành cho người thân bạn bè dịp lễ lộc.',
  'Thiết kế bao bì xịn xò đẳng cấp, yến bên trong đặc sánh giòn dai sần sật biếu tặng sếp sếp khen mãi.'
];

const shopReplies = [
  'QiQi Yến Sào cảm ơn phản hồi của bạn ạ. Chúc bạn và gia đình luôn mạnh khỏe!',
  'Cảm ơn bạn nhiều vì đã tin chọn sản phẩm của QiQi Yến Sào!',
  'Dạ shop cảm ơn anh/chị nhiều ạ. Chúc gia đình mình luôn ngập tràn sức khỏe nha!',
  'Sự hài lòng của khách hàng là động lực lớn nhất của QiQi Yến Sào. Cảm ơn bạn rất nhiều!',
  'Dạ cháu cảm ơn cô/chú đã ủng hộ sản phẩm của cửa hàng ạ!',
  'QiQi Yến Sào rất vui vì bạn hài lòng với sản phẩm và dịch vụ của shop!'
];

// Simple deterministic random generator based on a seed
function seedRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = seedStr.charCodeAt(i) + ((h << 5) - h);
    h = h | 0;
  }
  return function() {
    h = (h * 1664525 + 1013904223) | 0;
    return (h >>> 0) / 4294967296;
  };
}

// Generate reviews list deterministically
function generateDeterministicReviews(slug: string): Review[] {
  const rand = seedRandom(slug);
  
  // Target total count: between 80 and 200 reviews
  const targetCount = 80 + Math.floor(rand() * 121);
  
  const reviews: Review[] = [];
  
  // 1. Add predefined custom reviews first (if any)
  const predefined = SEEDED_REVIEWS[slug] || [];
  reviews.push(...predefined);
  
  // 2. Generate the rest deterministically
  let idCounter = 1;
  const nowMs = new Date('2026-06-06').getTime();
  const dateRangeMs = 120 * 24 * 60 * 60 * 1000; // 120 days ago
  
  while (reviews.length < targetCount) {
    const rVal = rand();
    
    // Pick name (always full names: Họ + Tên Đệm + Tên hoặc Họ + Tên)
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    let name = '';
    if (rand() < 0.85) {
      const middle = MIDDLE_NAMES[Math.floor(rand() * MIDDLE_NAMES.length)];
      name = `${first} ${middle} ${last}`;
    } else {
      name = `${first} ${last}`;
    }
    
    // Pick rating (mostly 5s, some 4s, rare 3s)
    const ratingVal = rand();
    let rating = 5;
    if (ratingVal < 0.08) rating = 4;
    else if (ratingVal < 0.09) rating = 3; // Rare 3 star
    
    // Construct content dynamically with varied templates
    const templateVal = rand();
    let content = '';
    
    // Pick specific category phrase
    let catPhrase = '';
    if (slug.includes('kieng') || slug.includes('isomalt')) {
      catPhrase = sugarFreePhrases[Math.floor(rand() * sugarFreePhrases.length)];
    } else if (slug.includes('dong-trung')) {
      catPhrase = cordycepsPhrases[Math.floor(rand() * cordycepsPhrases.length)];
    } else if (slug.includes('sam')) {
      catPhrase = ginsengPhrases[Math.floor(rand() * ginsengPhrases.length)];
    } else if (slug.includes('phen')) {
      catPhrase = rockSugarPhrases[Math.floor(rand() * rockSugarPhrases.length)];
    } else if (slug.includes('tho') || slug.includes('tinh-che') || slug.includes('rut-long')) {
      catPhrase = nestPhrases[Math.floor(rand() * nestPhrases.length)];
    } else {
      catPhrase = generalQualityPhrases[Math.floor(rand() * generalQualityPhrases.length)];
    }

    const open = openingPhrases[Math.floor(rand() * openingPhrases.length)];
    const qual = generalQualityPhrases[Math.floor(rand() * generalQualityPhrases.length)];
    const ship = shippingAndService[Math.floor(rand() * shippingAndService.length)];
    const end = recommendationPhrases[Math.floor(rand() * recommendationPhrases.length)];

    if (templateVal < 0.22) {
      // Type 1: Short & Simple
      content = shortReviews[Math.floor(rand() * shortReviews.length)];
      if (rand() < 0.5) content += ' ' + end;
    } else if (templateVal < 0.45) {
      // Type 2: Family Focus
      content = familyReviews[Math.floor(rand() * familyReviews.length)] + ' ' + catPhrase;
      if (rand() < 0.5) content += ' ' + end;
    } else if (templateVal < 0.65) {
      // Type 3: Quality & Service Focus
      content = open + ' ' + qual + ' ' + ship;
      if (rand() < 0.4) content += ' ' + end;
    } else if (templateVal < 0.8 && (slug.includes('set') || slug.includes('combo') || slug.includes('hu') || slug.includes('hũ'))) {
      // Type 4: Gift focus
      content = giftReviews[Math.floor(rand() * giftReviews.length)] + ' ' + catPhrase;
      if (rand() < 0.5) content += ' ' + ship;
    } else {
      // Type 5: In-depth mix
      const includeShip = rand() < 0.6;
      const parts = [
        open,
        catPhrase,
        includeShip ? ship : '',
        end
      ].filter(Boolean);
      content = parts.join(' ');
    }
    
    // Pick date (distributed in last 120 days)
    const reviewTimeMs = nowMs - Math.floor(rand() * dateRangeMs);
    const date = new Date(reviewTimeMs).toISOString().split('T')[0];
    
    // Pick owner reply (12% chance)
    let reply: string | undefined = undefined;
    if (rand() < 0.12) {
      reply = shopReplies[Math.floor(rand() * shopReplies.length)];
    }
    
    reviews.push({
      id: `gen-${slug}-${idCounter++}`,
      name,
      rating,
      content,
      date,
      reply
    });
  }
  
  // Sort reviews: newest date first, with predefined ones preserved at the very top if date is equal
  return reviews.sort((a, b) => {
    const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (diff !== 0) return diff;
    // Predefined reviews have priority if same date
    if (a.id.startsWith('ydp') || a.id.startsWith('ydt') || a.id.startsWith('ydk') || a.id.startsWith('ys') || a.id.startsWith('s6') || a.id.startsWith('s10') || a.id.startsWith('yt')) {
      return -1;
    }
    if (b.id.startsWith('ydp') || b.id.startsWith('ydt') || b.id.startsWith('ydk') || b.id.startsWith('ys') || b.id.startsWith('s6') || b.id.startsWith('s10') || b.id.startsWith('yt')) {
      return 1;
    }
    return 0;
  });
}

/**
 * Get all reviews for a product (combining generated, seeded, and localStorage reviews)
 */
export function getProductReviews(slug: string): Review[] {
  const generated = generateDeterministicReviews(slug);

  if (typeof window === 'undefined') {
    return generated;
  }

  // Load from localStorage if present
  try {
    const localData = localStorage.getItem(`reviews_${slug}`);
    const localReviews: Review[] = localData ? JSON.parse(localData) : [];
    // Combine local user reviews first, followed by generated reviews
    // filter out any generated reviews that match local ones by id
    const filteredGenerated = generated.filter(
      (gen) => !localReviews.some((local) => local.id === gen.id)
    );
    return [...localReviews, ...filteredGenerated];
  } catch (e) {
    console.error('Error loading reviews from localStorage', e);
    return generated;
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
