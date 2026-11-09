(() => {
  const sample = fields => ({sample:true, ...fields});
  const ocean = {primary:'#0A2F4F', night:'#061B30', aqua:'#25B6CC', bright:'#5ADBEA', paper:'#F5FBFD', mist:'#E4F2F7', line:'#BFDCE6', amber:'#F0A030', ink:'#0A1F33', link:'#076878', white:'#fff', muted:'#456376'};
  const urdu = text => ({text, needs_native_review:true});
  window.JAMI_CONFIG = {
    demoMode:true,
    business:{
      name:'Jami Water', tagline:'Every bottle leaves a record.', city:'Gujranwala', address:'[Plant address, Gujranwala]',
      mapLink:'https://www.google.com/maps/search/?api=1&query=Gujranwala%2C+Pakistan', mapEmbed:'https://maps.google.com/maps?q=Gujranwala%2C%20Pakistan&output=embed',
      email:'[Business email]', phone:'+92 321 5928003', whatsapp:'923215928003', urgentLine:'+92 321 5928003',
      hours:{Monday:'09:00–18:00',Tuesday:'09:00–18:00',Wednesday:'09:00–18:00',Thursday:'09:00–18:00',Friday:'09:00–18:00',Saturday:'09:00–18:00',Sunday:'Closed'},
      slots:['Morning','Afternoon','Evening'], freeDeliveryMinimum:1000, responseTime:'within one working day', scheduleSample:true
    },
    compliance:{
      pfaLicenceNo:'[PFA licence no.]', psqcaMarkNo:'[PSQCA licence/mark no.]', businessRegNo:'[Business registration no.]', staffMedicalDate:'[Staff medical certificate date]',
      documentUrls:{pfaLicenceNo:'',psqcaMarkNo:'',businessRegNo:'',staffMedicalDate:''},
      labName:'[Approved lab name]', latestReportDate:'[Lab report date]', testFrequency:'[e.g. monthly]',
      filters:[sample({date:'2026-09-01',item:'Sediment and carbon cartridges replaced'}),sample({date:'2026-10-01',item:'Sediment and carbon cartridges replaced'})]
    },
    theme:{
      ocean, aqua:{...ocean,primary:'#0A505C',paper:'#F2FBF8',mist:'#DDF3ED',night:'#07353C'},
      midnight:{...ocean,primary:'#061B30',paper:'#ECF4FA',mist:'#DCEAF6',night:'#031421',link:'#0A2F4F'},
      fonts:{heading:'Bricolage Grotesque',body:'Manrope',urdu:'Noto Nastaliq Urdu'}, radii:{panel:'16px',pill:'100px'}
    },
    products:[
      sample({size:'500ml',name:'500ml bottle',price:25,use:'Individual servings for events and meetings.'}),
      sample({size:'1.5L',name:'1.5L bottle',price:40,use:'Keep one at your desk or in the fridge.'}),
      sample({size:'6L',name:'6L bottle',price:70,use:'A carryable reserve for home or a gathering.'}),
      sample({size:'19L',name:'19L refillable bottle',price:180,use:'Return your empty on the next delivery.'})
    ],
    prices:{deposit:sample({price:1500}), tiers:[sample({minimum:10,price:175}),sample({minimum:25,price:170}),sample({minimum:50,price:160})]},
    plans:[sample({name:'Home',bottles:8,price:1360}),sample({name:'Family',bottles:15,price:2475}),sample({name:'Office',bottles:30,price:4800})],
    addons:['Dispenser (sale or rental)','Hand pump','Bottle stand','Cleaning kit'].map(name=>sample({name,price:null})),
    deliveryAreas:['Model Town','Satellite Town','Citi Housing','Wapda Town','Peoples Colony','Gujranwala Cantt','Rahwali','Garjakh','GT Road','Civil Lines','DC Colony','Gondlanwala'].map(name=>sample({name})),
    audiences:['Homes','Offices','Shops','Schools','Clinics','Mosques','Restaurants','Weddings, funerals and gatherings'],
    process:[
      ['source','Source water','Incoming water enters the plant and is assessed before treatment.',620],
      ['sediment','Sediment filter','A cartridge catches suspended grit and other particles.',620],
      ['carbon','Carbon filter','Activated carbon can reduce some compounds that affect taste and smell.',610],
      ['membrane','RO or UF','Reverse osmosis can reduce dissolved salts. Ultrafiltration works differently and does not remove salts in the same way.',78],
      ['uv','UV or ozone','A controlled disinfection stage can reduce microbial risk.',78],
      ['minerals','Remineralisation','When used, minerals may be adjusted after reverse osmosis.',112],
      ['bottle','Bottling','Inspected bottles are filled and closed with tamper-evident caps.',112]
    ].map(([id,title,detail,tds])=>({id,title,detail,tds,enabled:true})),
    labReports:[
      sample({id:'sample-oct',date:'2026-10-03',lab:'[Approved lab name]',file:'',values:[['TDS','112 mg/L','500 mg/L',112,500],['Arsenic','2 µg/L','10 µg/L',2,10],['pH','7.3','[limit per lab report]'],['E. coli / coliform','Not detected in 250 mL','[limit per lab report]'],['Sodium','17 mg/L','[limit per lab report]']]}),
      sample({id:'sample-sep',date:'2026-09-03',lab:'[Approved lab name]',file:'',values:[['TDS','118 mg/L','500 mg/L',118,500],['Arsenic','3 µg/L','10 µg/L',3,10],['pH','7.2','[limit per lab report]'],['E. coli / coliform','Not detected in 250 mL','[limit per lab report]'],['Sodium','19 mg/L','[limit per lab report]']]})
    ],
    batches:[sample({code:'JW-DEMO-001',date:'2026-10-02',report:'sample-oct'}),sample({code:'JW-DEMO-002',date:'2026-09-02',report:'sample-sep'})],
    reviews:{googleProfileUrl:'',googleRating:null,googleReviewCount:null,sampleReviewsEnabled:true,items:[
      ['Office dispenser','We were down to the last bottle in the office. I asked for afternoon delivery and left two empties with reception. Both were picked up.'],
      ['Family of six','We worked out that the family needed more than one bottle a week. It helped to agree a regular day instead of ordering every time.'],
      ['Home delivery','I got a message before the rider came, so I could leave the empty by the gate.',urdu('خالی بوتل واپس لے گئے۔')],
      ['Clinic reception','We wrote the batch code in our reception notebook so it would be easy to find later.'],
      ['Shop counter','I asked if the deposit was charged again on a swap. The reply set out the refill and deposit separately.'],
      ['School staff room','We needed bottles before a staff meeting. I sent the gate number on WhatsApp and told them where the empties were.'],
      ['Weekend gathering','We ordered small bottles for the guests and kept the 19-litre bottle for the kitchen.'],
      ['Repeat order','The evening slot is easier after work. I send the address pin and how many empties I have.',urdu('شام کا وقت ہمارے لیے آسان ہے۔')]
    ].map(([context,text,urdu])=>sample({context,text,urdu,aiGenerated:true}))},
    blog:[
      {slug:'tds-number',title:'How to read a TDS number',summary:'What a handheld meter tells you about dissolved solids.',sections:[
        ['Read the number in context','Total dissolved solids (TDS) describes the amount of material dissolved in water, often reported in milligrams per litre. A handheld meter estimates it from electrical conductivity. Temperature and the mixture of salts can affect that estimate.'],
        ['Lower is not automatically better','Saiqa Imran of PCRWR’s National Water Quality Laboratory told APP that roughly 300 to 500 mg/L can provide a more desirable mineral content. That is context about minerals, rather than a treatment target or proof of safety.'],
        ['Check the dated report','A handheld TDS meter cannot identify arsenic or tell you whether a sample contains E. coli. Match the report to your batch and compare each measured result with the applicable limit.']
      ],source:'https://www.app.com.pk/national/ultra-low-tds-water-may-not-mean-healthier-water-pcrwr-expert-2/',sourceLabel:'APP interview with PCRWR lab director',sourceNote:'[Add original PCRWR source if available]'},
      {slug:'clean-dispenser',title:'How to clean a water dispenser',summary:'A routine for the tap, tray and reservoir.',sections:[
        ['Start with the maker’s manual','Check the cleaning instructions for your model. Unplug it, let hot parts cool and remove the bottle before draining. Wash your hands before handling parts that touch the water.'],
        ['Clean, then sanitise','Wash removable parts as the manual directs. Use the sanitiser, contact time and rinse procedure specified by the manufacturer. Keep cleaning agents separate and avoid pouring unapproved products into the reservoir.'],
        ['Fit the next bottle','Wash your hands again. Keep the cap and bottle neck clear of the counter, and check the seal before fitting. Wipe the drip tray regularly and note when you last cleaned the reservoir.']
      ],source:'https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/information-product/frequently-asked-questions-about-bottled-water.html',sourceLabel:'Health Canada guidance on water cooler cleaning',sourceNote:'[Add manuals for supplied models]'},
      {slug:'arsenic-gujranwala',title:'Why arsenic testing matters',summary:'What a district groundwater study measured.',sections:[
        ['What was measured','A 2025 study tested 28 groundwater samples from water schemes in Gujranwala District. About 64% exceeded the WHO guideline of 10 µg/L for arsenic. The small study describes those sources, and its results cannot be applied to every local source or finished bottle.'],
        ['Look for an arsenic result','Arsenic can occur in groundwater. Appearance, taste and a TDS meter cannot measure it. Ask for the laboratory’s arsenic result in µg/L, the date and the applicable limit.'],
        ['Match the batch','Find the code on your bottle and use it to locate the finished-water report. If the report does not match, ask the supplier which batch was tested.']
      ],source:'https://geologia-croatica.hr/index.php/GC/article/view/1214',sourceLabel:'2025 Gujranwala groundwater study'},
      {slug:'store-bottles',title:'How to store 19-litre bottles',summary:'Keep sealed refills shaded, clean and upright.',sections:[
        ['Choose a clean place','Stand sealed bottles upright on a clean rack or stable raised surface, away from direct sun, heat, cleaning chemicals and floor splashes. Rotate your stock so older sealed bottles are used first.'],
        ['Keep the seal intact','Check for damage and make sure the cap is intact before fitting the bottle. Keep the neck clean when handling it, and follow your supplier’s storage and use instructions once opened.'],
        ['Set empties aside','Keep empties upright and separate from dirty containers. Put the cap back on if practical. Let the supplier know how many you have for collection and set aside any visibly damaged bottles.']
      ],source:'https://www.canada.ca/en/health-canada/services/food-nutrition/food-safety/information-product/frequently-asked-questions-about-bottled-water.html',sourceLabel:'Health Canada guidance on bottled water storage',sourceNote:'[Add plant storage and use instructions]'}
    ],
    faqs:[
      ['How does the bottle deposit work?','A deposit applies when you need a returnable bottle. Ask us to confirm the amount and refund terms. An empty swap is priced as a refill.'],
      ['Will you collect my empties?','Tell us how many empties you have when you order. Keep them ready for the rider and ask how damaged bottles are handled.'],
      ['When can I expect delivery?','Choose a preferred slot. We confirm the delivery day and time for your address on WhatsApp.'],
      ['How often is the water tested?','See the stated frequency and the date on each report in the lab library. Results are for the batch tested.'],
      ['How do I report a concern?','Keep the batch code and filling date handy. Use the complaints form or urgent phone line.'],
      ['What does TDS tell me?','It estimates dissolved solids. Check the individual chemical and microbiological results in the dated report for a fuller picture.']
    ],
    stats:[],
    offers:[sample({title:'Prepaid packs',detail:'Buy 10 refills in advance and get 1 bonus refill.'}),sample({title:'Referral offer',detail:'Ask about a bonus refill when a neighbour places their first eligible order.'})],
    timeline:[],
    urdu:[urdu('ہر بوتل کا بیچ نمبر دیکھیں۔'),urdu('آرڈر کے لیے واٹس ایپ کریں۔')],
    photos:{plant:{src:'',alt:'Jami Water plant exterior'},filters:{src:'',alt:'Jami Water filter room'},delivery:{src:'',alt:'Jami Water delivery vehicle'},team:{src:'',alt:'Jami Water plant team'}},
    stockCredits:[]
  };
})();
