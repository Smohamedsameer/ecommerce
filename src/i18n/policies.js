// Policy text in English and Tamil. {days}, {delivery}, {free}, {fee}, {handling} are filled from the server settings
// (GET /api/store/info), so the page always matches what the backend really does. Edit the wording here.
const en = {
  returns: {
    intro: 'We want you to love what you order. If something is not right, you can send it back within {days} days of delivery.',
    callouts: [['{days}', 'days from delivery to request a return'], ['2', 'business days for us to review'], ['5 to 7', 'business days for a refund to show']],
    sections: [
      { h: 'What can be returned', list: ['Items that are unused, unwashed and unworn, with tags and original packaging.', 'Items that arrived defective, damaged or different from what you ordered, in any condition.', 'Items from any seller on our store. The same policy applies to all sellers.'] },
      { h: 'What cannot be returned', list: ['Products marked “not returnable” on the product page (for example innerwear or customised items).', 'Items that have been worn, washed, altered or are missing tags.', 'Orders where the {days}-day window after delivery has closed.'] },
      { h: 'How to return an item', steps: ['Open Purchase history, choose the order and tap “Return items”.', 'Select the item, quantity and the reason, and add details or a note if needed.', 'We review the request within 2 business days and approve or explain why not.', 'After approval, our team shares how to send the item back.', 'Once we receive and check the item, your refund is processed. See the refund policy.'] },
      { h: 'Cancelling before dispatch', p: 'You can cancel an order from Purchase history any time before it ships. Stock is released straight away, and a paid online order is refunded to the original payment method.' },
      { h: 'Exchanges', p: 'We do not swap items directly. Return the item for a refund and place a new order for the size or colour you want. This is the fastest way to get the right fit.' },
      { h: 'Return shipping', p: 'If the return is because of our or the seller’s error (wrong, damaged or defective item) we cover the return shipping. For other reasons, return shipping charges may apply and we will tell you when the return is approved.' },
    ],
  },
  refunds: {
    intro: 'This explains how much you get back, how, and when.',
    callouts: [['100%', 'of the item price you paid (after coupon)'], ['+ GST', 'on the returned item is refunded too'], ['5 to 7', 'business days for the bank to show it']],
    sections: [
      { h: 'How much is refunded', list: ['The price you paid for the returned items, after any coupon discount that applied to them.', 'The GST charged on those items.', 'Handling and delivery fees are not refunded, because they cover the original shipment.', 'If you return only part of an order, you get a partial refund for those items.'] },
      { h: 'How you are refunded', list: ['Paid online (Razorpay): the refund goes back to the same card, UPI or bank account you paid with.', 'Cash on delivery: we refund by bank transfer or UPI. Our team contacts you for the details and shares a reference number.'] },
      { h: 'When you are refunded', list: ['The refund is started after we approve the return and receive the item, or as soon as we approve it when no item needs to come back.', 'Online refunds usually appear within 5 to 7 business days, depending on your bank.', 'You can follow every step in My returns.'] },
      { h: 'Cancelled orders', p: 'If you cancel before shipping and you had paid online, the amount is refunded to your original payment method. Cash on delivery orders have nothing to refund.' },
      { h: 'Payment deducted but order not placed', p: 'If money left your account but you did not get an order confirmation, it is normally reversed automatically by your bank within 5 to 7 business days. If it is not, contact us with the payment reference.' },
      { h: 'If a return is rejected', p: 'We always give a reason, shown on your return. A rejected return means no refund for that request. You can contact us if you think we made a mistake.' },
    ],
  },
  shipping: {
    intro: 'We deliver across India.',
    callouts: [['{delivery}', 'days estimated after confirmation'], ['{free}', 'order value for free delivery'], ['{fee}', 'delivery fee below that']],
    sections: [
      { h: 'Delivery time', p: 'Orders are confirmed instantly and usually dispatched in 1 to 2 days. The estimated delivery is {delivery} days from confirmation. Remote areas can take longer.' },
      { h: 'Charges', list: ['Free delivery on orders with items worth {free} or more.', 'Below that, delivery is {fee}.', 'A small handling fee of {handling} applies to every order, and GST is added at checkout.'] },
      { h: 'Tracking', p: 'When your order ships you can see the courier and tracking number in your Purchase history.' },
      { h: 'Delays and failed delivery', p: 'If you are not available, the courier will usually try again. If your order is delayed beyond the estimate, contact us and we will chase it.' },
    ],
  },
  privacy: {
    intro: 'We collect only what we need to run your orders.',
    sections: [
      { h: 'What we collect', list: ['Your name, email and phone number.', 'Delivery addresses and order history.', 'Reviews, wishlist and return requests you make.'] },
      { h: 'How we use it', list: ['To process, deliver and support your orders and returns.', 'To show your purchase history and let you track orders.', 'We do not sell your personal data.'] },
      { h: 'Payments', p: 'Online payments are handled by Razorpay. We never see or store your card or UPI details.' },
      { h: 'On your device', p: 'Your cart, theme and language are stored in your browser. Signing out removes your sign-in. You can clear the rest from your browser settings.' },
      { h: 'Your choices', p: 'You can update your profile in Account and settings. To delete your account or data, contact us.' },
    ],
  },
  terms: {
    intro: 'By using this store you agree to these terms.',
    sections: [
      { h: 'Orders', p: 'An order is confirmed once payment is received (or the order is placed with cash on delivery). We may cancel an order if an item is unavailable or the price was shown wrongly, and refund any payment.' },
      { h: 'Prices', p: 'All prices are in Indian rupees. Delivery, handling and GST are shown before you pay.' },
      { h: 'Sellers', p: 'Products are listed by independent sellers. The return and refund policies apply to every seller.' },
      { h: 'Accounts', p: 'Keep your password private. You are responsible for activity on your account.' },
      { h: 'Reviews', p: 'Reviews must be honest and respectful. We may remove reviews that break this rule.' },
    ],
  },
};

const ta = {
  returns: {
    intro: 'நீங்கள் ஆர்டர் செய்ததை விரும்ப வேண்டும் என்பதே எங்கள் விருப்பம். ஏதாவது சரியில்லை என்றால், டெலிவரி ஆன {days} நாட்களுக்குள் திருப்பி அனுப்பலாம்.',
    callouts: [['{days}', 'நாட்கள்: டெலிவரிக்குப் பின் திருப்பக் கோரிக்கை வைக்கலாம்'], ['2', 'வேலை நாட்களுக்குள் நாங்கள் மதிப்பாய்வு செய்வோம்'], ['5 முதல் 7', 'வேலை நாட்களில் பணம் வங்கியில் தெரியும்']],
    sections: [
      { h: 'எவற்றைத் திருப்பலாம்', list: ['பயன்படுத்தாத, துவைக்காத, அணியாத பொருட்கள் (டேக் மற்றும் அசல் பேக்கிங்குடன்).', 'குறைபாட்டுடன், சேதமடைந்து, அல்லது ஆர்டர் செய்ததிலிருந்து வேறுபட்டு வந்த பொருட்கள் (எந்த நிலையிலும்).', 'எங்கள் கடையில் உள்ள எந்த விற்பனையாளரின் பொருளும். எல்லா விற்பனையாளர்களுக்கும் ஒரே கொள்கை.'] },
      { h: 'எவற்றைத் திருப்ப முடியாது', list: ['பொருள் பக்கத்தில் “திருப்ப முடியாது” எனக் குறிக்கப்பட்டவை (எ.கா. உள்ளாடைகள் அல்லது தனிப்பயன் பொருட்கள்).', 'அணிந்த, துவைத்த, மாற்றப்பட்ட அல்லது டேக் இல்லாத பொருட்கள்.', 'டெலிவரிக்குப் பின் {days} நாள் கால அவகாசம் முடிந்த ஆர்டர்கள்.'] },
      { h: 'பொருளைத் திருப்புவது எப்படி', steps: ['வாங்கிய வரலாற்றைத் திறந்து, ஆர்டரைத் தேர்ந்தெடுத்து “பொருட்களைத் திருப்பு” என்பதைத் தட்டவும்.', 'பொருள், எண்ணிக்கை, காரணத்தைத் தேர்ந்தெடுத்து, தேவையெனில் விவரம் சேர்க்கவும்.', 'கோரிக்கையை 2 வேலை நாட்களுக்குள் மதிப்பாய்வு செய்து, ஒப்புக்கொள்வோம் அல்லது காரணம் சொல்வோம்.', 'ஒப்புதலுக்குப் பிறகு, பொருளை எப்படி அனுப்புவது என்பதை எங்கள் குழு தெரிவிக்கும்.', 'பொருள் கிடைத்துச் சரிபார்த்தவுடன் பணத் திரும்பப்பெறல் செயலாக்கப்படும். பணத் திரும்பப்பெறல் கொள்கையைப் பார்க்கவும்.'] },
      { h: 'அனுப்புவதற்கு முன் ரத்து செய்தல்', p: 'ஆர்டர் அனுப்பப்படுவதற்கு முன் எப்போது வேண்டுமானாலும் வாங்கிய வரலாற்றிலிருந்து ரத்து செய்யலாம். இருப்பு உடனே விடுவிக்கப்படும்; ஆன்லைனில் செலுத்திய ஆர்டருக்குப் பணம் அசல் கட்டண முறைக்கே திரும்பும்.' },
      { h: 'மாற்றம் (எக்ஸ்சேஞ்ச்)', p: 'நாங்கள் நேரடியாகப் பொருட்களை மாற்றித் தருவதில்லை. பொருளைத் திருப்பிப் பணத்தைப் பெற்று, விரும்பும் அளவு அல்லது நிறத்துக்குப் புதிய ஆர்டர் செய்யுங்கள். சரியான பொருத்தத்தைப் பெற இதுவே வேகமான வழி.' },
      { h: 'திருப்பி அனுப்பும் செலவு', p: 'எங்கள் அல்லது விற்பனையாளரின் தவறால் (தவறான, சேதமடைந்த, குறைபாடுள்ள பொருள்) திருப்புவதாக இருந்தால் திருப்பி அனுப்பும் செலவை நாங்கள் ஏற்போம். மற்ற காரணங்களுக்கு கட்டணம் இருக்கலாம்; திருப்பம் ஒப்புக்கொள்ளப்படும்போது தெரிவிப்போம்.' },
    ],
  },
  refunds: {
    intro: 'எவ்வளவு, எப்படி, எப்போது பணம் திரும்பக் கிடைக்கும் என்பதை இது விளக்குகிறது.',
    callouts: [['100%', 'நீங்கள் செலுத்திய பொருள் விலை (கூப்பனுக்குப் பின்)'], ['+ GST', 'திருப்பிய பொருளின் GST-யும் திரும்பத் தரப்படும்'], ['5 முதல் 7', 'வேலை நாட்களில் வங்கியில் தெரியும்']],
    sections: [
      { h: 'எவ்வளவு திரும்பக் கிடைக்கும்', list: ['திருப்பிய பொருட்களுக்கு நீங்கள் செலுத்திய விலை (அவற்றுக்குப் பொருந்திய கூப்பன் தள்ளுபடிக்குப் பின்).', 'அந்தப் பொருட்களுக்கான GST.', 'கையாளும் மற்றும் டெலிவரிக் கட்டணங்கள் திருப்பித் தரப்படாது, ஏனெனில் அவை முதல் அனுப்புதலுக்கானவை.', 'ஆர்டரின் ஒரு பகுதியை மட்டும் திருப்பினால், அந்தப் பொருட்களுக்கு மட்டும் பகுதி பணம் கிடைக்கும்.'] },
      { h: 'எப்படித் திரும்பக் கிடைக்கும்', list: ['ஆன்லைனில் (Razorpay) செலுத்தியிருந்தால்: நீங்கள் பயன்படுத்திய கார்டு, UPI அல்லது வங்கிக் கணக்கிற்கே திரும்பும்.', 'கேஷ் ஆன் டெலிவரி: வங்கிப் பரிமாற்றம் அல்லது UPI மூலம் வழங்குவோம். விவரங்களுக்கு எங்கள் குழு உங்களைத் தொடர்பு கொண்டு, குறிப்பு எண்ணைப் பகிரும்.'] },
      { h: 'எப்போது திரும்பக் கிடைக்கும்', list: ['திருப்பத்தை ஒப்புக்கொண்டு பொருள் கிடைத்த பின் பணத் திரும்பப்பெறல் தொடங்கும்.', 'ஆன்லைன் பணம் உங்கள் வங்கியைப் பொறுத்து பொதுவாக 5 முதல் 7 வேலை நாட்களில் தெரியும்.', 'ஒவ்வொரு படியையும் “என் திருப்பங்கள்” பக்கத்தில் பின்தொடரலாம்.'] },
      { h: 'ரத்து செய்யப்பட்ட ஆர்டர்கள்', p: 'அனுப்புவதற்கு முன் ரத்து செய்து, ஆன்லைனில் செலுத்தியிருந்தால், தொகை அசல் கட்டண முறைக்கே திரும்பும். கேஷ் ஆன் டெலிவரி ஆர்டர்களுக்குத் திருப்ப எதுவும் இல்லை.' },
      { h: 'பணம் கழிந்தும் ஆர்டர் பதிவாகவில்லை எனில்', p: 'கணக்கிலிருந்து பணம் போய், ஆர்டர் உறுதிப்பாடு வரவில்லை என்றால், பொதுவாக உங்கள் வங்கி 5 முதல் 7 வேலை நாட்களில் தானாகவே திருப்பிவிடும். இல்லையெனில், கட்டணக் குறிப்பு எண்ணுடன் எங்களைத் தொடர்பு கொள்ளுங்கள்.' },
      { h: 'திருப்பம் நிராகரிக்கப்பட்டால்', p: 'எப்போதும் காரணம் தெரிவிப்போம்; அது உங்கள் திருப்பத்தில் காட்டப்படும். நிராகரிக்கப்பட்ட கோரிக்கைக்குப் பணம் கிடைக்காது. நாங்கள் தவறு செய்ததாக நினைத்தால் எங்களைத் தொடர்பு கொள்ளலாம்.' },
    ],
  },
  shipping: {
    intro: 'இந்தியா முழுவதும் டெலிவரி செய்கிறோம்.',
    callouts: [['{delivery}', 'நாட்கள்: உறுதிசெய்த பின் மதிப்பிடப்பட்ட டெலிவரி'], ['{free}', 'இலவச டெலிவரிக்கான ஆர்டர் மதிப்பு'], ['{fee}', 'அதற்குக் கீழ் டெலிவரிக் கட்டணம்']],
    sections: [
      { h: 'டெலிவரி நேரம்', p: 'ஆர்டர்கள் உடனே உறுதிசெய்யப்பட்டு பொதுவாக 1 முதல் 2 நாட்களில் அனுப்பப்படும். உறுதிசெய்த {delivery} நாட்களுக்குள் டெலிவரி எதிர்பார்க்கலாம். தொலைதூரப் பகுதிகளுக்கு அதிக நேரம் ஆகலாம்.' },
      { h: 'கட்டணங்கள்', list: ['{free} அல்லது அதற்கு மேல் மதிப்புள்ள பொருட்களுக்கு இலவச டெலிவரி.', 'அதற்குக் கீழ் டெலிவரிக் கட்டணம் {fee}.', 'ஒவ்வொரு ஆர்டருக்கும் {handling} கையாளும் கட்டணம் உண்டு; செலுத்தும்போது GST சேர்க்கப்படும்.'] },
      { h: 'கண்காணிப்பு', p: 'ஆர்டர் அனுப்பப்பட்டதும் கூரியர் மற்றும் கண்காணிப்பு எண்ணை உங்கள் வாங்கிய வரலாற்றில் பார்க்கலாம்.' },
      { h: 'தாமதம் மற்றும் டெலிவரி தோல்வி', p: 'நீங்கள் இல்லாவிட்டால் கூரியர் பொதுவாக மீண்டும் முயற்சிக்கும். மதிப்பீட்டை மீறித் தாமதமானால் எங்களைத் தொடர்பு கொள்ளுங்கள்; நாங்கள் பின்தொடர்வோம்.' },
    ],
  },
  privacy: {
    intro: 'உங்கள் ஆர்டர்களை நடத்தத் தேவையானதை மட்டுமே சேகரிக்கிறோம்.',
    sections: [
      { h: 'நாங்கள் சேகரிப்பவை', list: ['உங்கள் பெயர், மின்னஞ்சல், தொலைபேசி எண்.', 'டெலிவரி முகவரிகள் மற்றும் ஆர்டர் வரலாறு.', 'நீங்கள் எழுதும் மதிப்புரைகள், விருப்பப் பட்டியல், திருப்பக் கோரிக்கைகள்.'] },
      { h: 'எப்படிப் பயன்படுத்துகிறோம்', list: ['உங்கள் ஆர்டர்கள் மற்றும் திருப்பங்களைச் செயலாக்க, டெலிவரி செய்ய, உதவ.', 'வாங்கிய வரலாற்றைக் காட்டவும் ஆர்டர்களைக் கண்காணிக்கவும்.', 'உங்கள் தனிப்பட்ட தரவை நாங்கள் விற்பதில்லை.'] },
      { h: 'கட்டணங்கள்', p: 'ஆன்லைன் கட்டணங்களை Razorpay கையாளுகிறது. உங்கள் கார்டு அல்லது UPI விவரங்களை நாங்கள் பார்ப்பதும் இல்லை, சேமிப்பதும் இல்லை.' },
      { h: 'உங்கள் சாதனத்தில்', p: 'உங்கள் கூடை, தோற்றம், மொழி ஆகியவை உங்கள் உலாவியில் சேமிக்கப்படும். வெளியேறினால் உள்நுழைவு நீங்கும். மற்றவற்றை உலாவி அமைப்புகளில் அழிக்கலாம்.' },
      { h: 'உங்கள் தேர்வுகள்', p: 'கணக்கு மற்றும் அமைப்புகளில் சுயவிவரத்தைப் புதுப்பிக்கலாம். கணக்கு அல்லது தரவை நீக்க எங்களைத் தொடர்பு கொள்ளுங்கள்.' },
    ],
  },
  terms: {
    intro: 'இந்தக் கடையைப் பயன்படுத்துவதன் மூலம் இந்த விதிமுறைகளை ஏற்கிறீர்கள்.',
    sections: [
      { h: 'ஆர்டர்கள்', p: 'கட்டணம் பெறப்பட்டதும் (அல்லது கேஷ் ஆன் டெலிவரியாக ஆர்டர் செய்ததும்) ஆர்டர் உறுதியாகும். பொருள் இல்லாவிட்டால் அல்லது விலை தவறாகக் காட்டப்பட்டிருந்தால் ஆர்டரை ரத்து செய்து, செலுத்திய தொகையைத் திருப்பித் தரலாம்.' },
      { h: 'விலைகள்', p: 'அனைத்து விலைகளும் இந்திய ரூபாயில். டெலிவரி, கையாளும் கட்டணம், GST ஆகியவை நீங்கள் செலுத்தும் முன் காட்டப்படும்.' },
      { h: 'விற்பனையாளர்கள்', p: 'பொருட்களைச் சுயாதீன விற்பனையாளர்கள் பட்டியலிடுகிறார்கள். திருப்பம் மற்றும் பணத் திரும்பப்பெறல் கொள்கைகள் எல்லா விற்பனையாளர்களுக்கும் பொருந்தும்.' },
      { h: 'கணக்குகள்', p: 'உங்கள் கடவுச்சொல்லை ரகசியமாக வைத்திருங்கள். உங்கள் கணக்கின் செயல்பாடுகளுக்கு நீங்களே பொறுப்பு.' },
      { h: 'மதிப்புரைகள்', p: 'மதிப்புரைகள் நேர்மையாகவும் மரியாதையாகவும் இருக்க வேண்டும். இந்த விதியை மீறும் மதிப்புரைகளை நீக்கலாம்.' },
    ],
  },
};

export default { en, ta };
