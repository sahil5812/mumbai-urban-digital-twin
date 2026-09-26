import re

fpath = 'frontend/src/components/WeatherPortalView.tsx'

with open(fpath, 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Tonight Alert
hi_tonight = "आंशिक रूप से बादल छाए रहेंगे, देर रात कुर्ला, हिंदमाता और ठाणे मुंब्रा में गरज के साथ बौछारें पड़ने की संभावना। न्यूनतम: 26°C"
mr_tonight = "अंशतः ढगाळ वातावरण, रात्री उशिरा कुर्ला, हिंदमाता आणि ठाणे मुंब्रा भागात मेघगर्जनेसह पाऊस पडण्याची शक्यता. किमान: 26°C"
en_tonight = "Partly cloudy with localized thunderstorm cells developing over Kurla, Hindmata & Thane Mumbra late. Lo: 26°C"
rep_tonight = f"{{language === 'hi' ? '{hi_tonight}' : language === 'mr' ? '{mr_tonight}' : '{en_tonight}'}}"

# 2. Tomorrow Alert
hi_tomorrow = "बादलों के बीच कभी-कभी धूप खिलेगी, दोपहर में 14:15 IST उच्च ज्वार (4.2m) के समय छिटपुट गरज-चमक के साथ बारिश। अधिकतम: 32°C"
mr_tomorrow = "ढगांमधून अधूनमधून सूर्यप्रकाश, दुपारी 14:15 IST च्या उधाणाच्या भरतीच्या (4.2m) वेळी तुरळक मेघगर्जनेसह पावसाची शक्यता. कमाल: 32°C"
en_tomorrow = "Sun breaking through clouds at times with stray thunderstorms in the afternoon coinciding with 14:15 IST High Tide (4.2m). Hi: 32°C"
rep_tomorrow = f"{{language === 'hi' ? '{hi_tomorrow}' : language === 'mr' ? '{mr_tomorrow}' : '{en_tomorrow}'}}"

# 3. Weather Condition Subtitle
hi_cond = "मानसून के घने बादल • अत्यधिक उमस"
mr_cond = "मान्सूनचे दाट ढग • दमट हवामान"
en_cond = "Monsoon Overcast • Humid"
rep_cond = f"{{language === 'hi' ? '{hi_cond}' : language === 'mr' ? '{mr_cond}' : '{en_cond}'}}"

# 4. Moderate Surge
hi_surge = "मध्यम उछाल"
mr_surge = "मध्यम लाटांचा जोर"
en_surge = "Moderate Surge"
rep_surge = f"{{language === 'hi' ? '{hi_surge}' : language === 'mr' ? '{mr_surge}' : '{en_surge}'}}"

# 5. Mithi & Parsik basins
hi_basins = "मीठी व पारसिक बेसिन"
mr_basins = "मिठी व पारसिक खोरे"
en_basins = "Mithi & Parsik basins"
rep_basins = f"{{language === 'hi' ? '{hi_basins}' : language === 'mr' ? '{mr_basins}' : '{en_basins}'}}"

# 6. Dewatering Pumps
hi_pumps = "264 क्युमेक्स क्षमता"
mr_pumps = "264 क्युमेक्स क्षमता"
en_pumps = "264 cumecs capacity"
rep_pumps = f"{{language === 'hi' ? '{hi_pumps}' : language === 'mr' ? '{mr_pumps}' : '{en_pumps}'}}"

# 7. Hydrological Advisory
hi_adv = "रविवार देर रात उच्च ज्वार (+4.1m) के साथ गरज-चमक वाली बारिश की संभावना। निचले सबवे (मिलन, अंधेरी, हिंदमाता, रेती बंदर) स्वचालित सेंसर निगरानी में हैं।"
mr_adv = "रविवार रात्री उशिरा उधाणाची भरती (+4.1m) आणि वादळी पावसाची शक्यता. सखल सबवे (मिलन, अंधेरी, हिंदमाता, रेती बंदर) स्वयंचलित सेन्सर देखरेखीखाली आहेत."
en_adv = "Thunderstorm cells expected late Sunday night with high tide surge coincidence (+4.1m). Lowline subways (Milan, Andheri, Hindmata, Reti Bunder) under automated sensor surveillance."
rep_adv = f"{{language === 'hi' ? '{hi_adv}' : language === 'mr' ? '{mr_adv}' : '{en_adv}'}}"

# Safe replacement
code = re.sub(r"\{language === 'hi' \? [^\n\}]+Lo:[^\n\}]+\}", rep_tonight, code)
code = re.sub(r"\{language === 'hi' \? [^\n\}]+Hi:[^\n\}]+\}", rep_tomorrow, code)
code = re.sub(r"\{language === 'hi' \? [^\n\}]+Monsoon Overcast[^\n\}]+\}", rep_cond, code)
code = re.sub(r"\{language === 'hi' \? [^\n\}]+Moderate Surge[^\n\}]+\}", rep_surge, code)
code = re.sub(r"\{language === 'hi' \? [^\n\}]+Mithi & Parsik basins[^\n\}]+\}", rep_basins, code)
code = re.sub(r"\{language === 'hi' \? [^\n\}]+264 cumecs capacity[^\n\}]+\}", rep_pumps, code)
code = re.sub(r"\{language === 'hi' \? [^\n\}]+Thunderstorm cells expected[^\n\}]+\}", rep_adv, code)

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(code)

print("SUCCESS: WeatherPortalView updated with clean Hindi & Marathi!")