// Sparse per-chapter narrative overrides. Most chapters use the book-level context.
// These overrides handle specially significant chapters (prophecy reveals, key events, etc.)

interface ChapterOverride {
  context: string;
  prestigeContext?: string;
}

const OVERRIDES: Record<string, ChapterOverride> = {
  // GENESIS
  "genesis:1": { context: "You stand at the edge of nothing. The Spirit hovers over the deep. Light is about to be spoken into being.", prestigeContext: "You stand again at the beginning. Light still answers when God speaks." },
  "genesis:3": { context: "You walk in the cool of the day with the first humans. A serpent speaks. A fruit is taken. The world changes — but a promise is made about a coming offspring.", prestigeContext: "You watch the fall again. The promise of the seed shines brighter against the dark." },
  "genesis:12": { context: "An old man named Abram is called away from his country toward a land he has not seen. Through him, every family on earth will be blessed.", prestigeContext: "Abraham hears the call again. The promise still echoes outward to all nations." },
  "genesis:22": { context: "You walk to Mount Moriah with Abraham and Isaac. A father, a son, wood for the offering — and a ram caught in a thicket.", prestigeContext: "Moriah again. The shadow of a future Father and Son grows clearer." },
  "genesis:49": { context: "Jacob gathers his sons for a final blessing. The scepter, he says, will not depart from Judah.", prestigeContext: "Jacob blesses his sons again. Judah's lion already roars in your memory." },

  // EXODUS
  "exodus:3": { context: "You stand before a bush that burns but is not consumed. A name is given: I AM.", prestigeContext: "The bush burns again. The Name still hums in the air." },
  "exodus:12": { context: "Lambs are slaughtered. Doorposts marked. Death passes over those covered by blood.", prestigeContext: "The Passover comes again. Every detail points forward to a greater Lamb." },
  "exodus:14": { context: "You stand at the edge of the sea, Egypt thundering behind, water before. A wind rises. A path opens.", prestigeContext: "The sea splits again. You walk between walls of water with new wonder." },
  "exodus:20": { context: "Smoke covers Sinai. Ten words are spoken from the cloud — words that will shape every nation that hears them.", prestigeContext: "The thunder rolls down Sinai again. The ten words still cut clean." },

  // NUMBERS
  "numbers:21": { context: "Serpents come into the camp. Moses lifts a bronze serpent on a pole, and those who look at it live.", prestigeContext: "The serpent is lifted again. You see John 3 in every glance." },
  "numbers:24": { context: "Balaam speaks against his will: a star will come out of Jacob, a scepter from Israel.", prestigeContext: "Balaam's reluctant prophecy returns. The star is unmistakable now." },

  // DEUTERONOMY
  "deuteronomy:18": { context: "Moses promises a future prophet like himself, raised up from among the brothers — and this Prophet must be heard.", prestigeContext: "Moses promises the Prophet again. You know whom he means." },

  // 2 SAMUEL
  "2samuel:7": { context: "David wants to build God a house. Instead, God promises to build David a house — a kingdom that will never end.", prestigeContext: "The Davidic covenant is given again. Its weight is fuller now." },

  // PSALMS
  "psalms:2": { context: "Why do the nations rage? God has installed his King on the holy hill of Zion — his Anointed One.", prestigeContext: "Psalm 2 returns. The nations still rage; the King still reigns." },
  "psalms:16": { context: "David sings: my flesh will dwell secure. You will not abandon my soul to the grave.", prestigeContext: "Psalm 16 returns — and Acts 2 echoes back through it." },
  "psalms:22": { context: "A psalm that begins in despair: My God, my God, why have you forsaken me? Hands and feet pierced. Garments divided. And ends in praise.", prestigeContext: "Psalm 22 again. Every line lands like a hammer on the cross." },
  "psalms:69": { context: "The psalmist is hated without cause and given gall to drink. Zeal for God's house consumes him.", prestigeContext: "Psalm 69 returns. The Gospels hum beneath every line." },
  "psalms:110": { context: "The Lord said to my Lord: sit at my right hand. A king and priest after the order of Melchizedek.", prestigeContext: "Psalm 110 returns. Hebrews already rings in your ears." },
  "psalms:118": { context: "The stone the builders rejected has become the cornerstone. Hosanna in the highest.", prestigeContext: "Psalm 118 returns. The cornerstone is set." },

  // ISAIAH
  "isaiah:6": { context: "You stand in the temple. Seraphim cry holy, holy, holy. A coal touches lips. A voice asks: whom shall I send?", prestigeContext: "The throne room shines again. Holy still trembles in your bones." },
  "isaiah:7": { context: "A king is afraid of two enemies. The prophet gives a sign greater than the moment requires: a virgin will conceive.", prestigeContext: "Isaiah 7 returns. The sign always pointed further than Ahaz could see." },
  "isaiah:9": { context: "The people walking in darkness have seen a great light. A child is born; the government rests on his shoulders.", prestigeContext: "Isaiah 9 returns. Bethlehem is already on the horizon." },
  "isaiah:11": { context: "A shoot from the stump of Jesse — the Spirit of the Lord rests on him. The wolf and the lamb shall lie together.", prestigeContext: "Isaiah 11 returns. The peaceable kingdom waits at history's end." },
  "isaiah:40": { context: "Comfort, comfort my people. A voice cries in the wilderness: prepare the way of the Lord.", prestigeContext: "Isaiah 40 returns. The wilderness voice waits in the gospels." },
  "isaiah:42": { context: "Behold my Servant whom I uphold. A bruised reed he will not break.", prestigeContext: "Isaiah 42 returns. The Servant's gentleness still amazes." },
  "isaiah:53": { context: "He was despised and rejected. Pierced for our transgressions. Crushed for our iniquities. By his wounds we are healed.", prestigeContext: "Isaiah 53 returns. The crucifixion stands fully foretold." },
  "isaiah:61": { context: "The Spirit of the Lord is upon me, because he has anointed me to bring good news to the poor.", prestigeContext: "Isaiah 61 returns. Luke 4 already echoes here." },
  "isaiah:65": { context: "Behold, I create new heavens and a new earth. The former things shall not be remembered.", prestigeContext: "Isaiah 65 returns. The new creation already shines through." },

  // JEREMIAH
  "jeremiah:23": { context: "The Lord promises a righteous Branch from David — a king who will reign wisely and bring justice.", prestigeContext: "Jeremiah 23 returns. The Branch has already grown." },
  "jeremiah:31": { context: "I will make a new covenant with the house of Israel. I will write my law on their hearts.", prestigeContext: "Jeremiah 31 returns. The new covenant has come in his blood." },

  // EZEKIEL
  "ezekiel:36": { context: "I will give you a new heart, and put a new spirit within you. I will remove the heart of stone.", prestigeContext: "Ezekiel 36 returns. The new heart you have been given was promised long ago." },
  "ezekiel:37": { context: "You stand in a valley of dry bones. Can these bones live? The wind blows. The bones rattle. An army stands.", prestigeContext: "The valley returns. The bones rise again — like a rehearsal of resurrection." },

  // DANIEL
  "daniel:2": { context: "Nebuchadnezzar dreams of a statue. A stone cut without hands strikes it and becomes a mountain that fills the earth.", prestigeContext: "Daniel 2 returns. The mountain still rises through history." },
  "daniel:7": { context: "You see one like a son of man coming on the clouds — given dominion and an everlasting kingdom.", prestigeContext: "Daniel 7 returns. The Son of Man has come and will come again." },
  "daniel:9": { context: "Daniel reads Jeremiah and prays. Gabriel tells him of seventy weeks decreed.", prestigeContext: "Daniel 9 returns. The weeks have run their course." },

  // MICAH
  "micah:5": { context: "Out of Bethlehem Ephrathah, too small to be among the clans of Judah, comes the ruler whose origins are from of old.", prestigeContext: "Micah 5 returns. Bethlehem already glows in your memory." },

  // ZECHARIAH
  "zechariah:9": { context: "Rejoice, O daughter of Zion. Your king is coming — humble, mounted on a donkey.", prestigeContext: "Zechariah 9 returns. The Palm Sunday road is already laid." },
  "zechariah:11": { context: "Thirty pieces of silver — the price of the shepherd, thrown to the potter in the house of the Lord.", prestigeContext: "Zechariah 11 returns. The thirty pieces are already counted out." },
  "zechariah:12": { context: "They shall look on me, the one whom they have pierced, and mourn for him as for a firstborn.", prestigeContext: "Zechariah 12 returns. The pierced one is already known." },

  // MALACHI
  "malachi:3": { context: "Behold, I send my messenger, and he will prepare the way before me.", prestigeContext: "Malachi 3 returns. The messenger has come and gone." },
  "malachi:4": { context: "The sun of righteousness will rise with healing in its wings. And before that day, Elijah comes.", prestigeContext: "Malachi 4 returns. The dawn has broken." },

  // GOSPELS
  "matthew:1": { context: "You read a long list of names. Each one carries a thousand stories. The list ends with Jesus, called Christ.", prestigeContext: "The genealogy returns. Each name is a friend now." },
  "matthew:2": { context: "Magi follow a star. Herod schemes. A child is hurried into Egypt and returns to Nazareth — fulfilling words spoken centuries earlier.", prestigeContext: "The flight to Egypt returns. Every prophecy snaps into place." },
  "matthew:5": { context: "You sit on a mountainside. He opens his mouth and teaches. Blessed are the poor in spirit. Blessed are those who mourn.", prestigeContext: "The Sermon on the Mount returns. Each beatitude lands deeper." },
  "matthew:24": { context: "Not one stone of the temple, he tells them, will be left on another. He speaks of the end and his return.", prestigeContext: "The Olivet Discourse returns. The warnings still feel near." },
  "matthew:26": { context: "Bread broken. A cup poured. Gethsemane's olives. A betrayer's kiss. A rooster crows.", prestigeContext: "The night returns. Each scene is etched into your memory now." },
  "matthew:27": { context: "Pilate washes his hands. The crown of thorns. The cross. Darkness. A torn veil. A centurion confesses.", prestigeContext: "The cross returns. You stand at Golgotha again." },
  "matthew:28": { context: "An angel rolls back the stone. He is risen. He goes before you into Galilee.", prestigeContext: "The empty tomb returns. The morning still feels new." },
  "luke:2": { context: "A census brings them to Bethlehem. There is no room. A baby is wrapped and laid in a manger. Shepherds run.", prestigeContext: "Bethlehem returns. The angels still split the night." },
  "luke:23": { context: "Two criminals beside him. One mocks. One asks to be remembered. A garden tomb waits.", prestigeContext: "Calvary returns. The thief's prayer still moves you." },
  "luke:24": { context: "Two walk to Emmaus. A stranger opens the Scriptures. Their hearts burn. Then they see — and he vanishes.", prestigeContext: "Emmaus returns. The road still warms you." },
  "john:1": { context: "In the beginning was the Word, and the Word was with God, and the Word was God. The Word became flesh.", prestigeContext: "John 1 returns. The Word still becomes flesh." },
  "john:3": { context: "A teacher comes by night. He must be born again, Jesus says. As Moses lifted the serpent, so must the Son of Man be lifted.", prestigeContext: "Nicodemus returns. The serpent and the cross are joined." },
  "john:14": { context: "Let not your heart be troubled. I go to prepare a place. I will come again. The Helper is coming.", prestigeContext: "John 14 returns. The promise still steadies you." },
  "john:19": { context: "It is finished, he says. They do not break his legs. They pierce his side. Joseph of Arimathea takes the body.", prestigeContext: "The cross returns in John's voice. Each detail fulfills Scripture." },
  "john:20": { context: "Mary at the tomb. Peter and John running. A locked door, and suddenly he stands among them. Thomas touches the wounds.", prestigeContext: "The resurrection returns. He still says, 'Peace be with you.'" },

  // ACTS
  "acts:1": { context: "He is taken up before their eyes. Two men in white promise his return. They wait in Jerusalem.", prestigeContext: "The Ascension returns. They are still told to wait." },
  "acts:2": { context: "A sound like a rushing wind. Tongues of fire. Peter stands and preaches Joel's prophecy. Three thousand are baptized.", prestigeContext: "Pentecost returns. The wind still blows." },
  "acts:9": { context: "On the road to Damascus, a light flashes. Saul falls. A voice asks, 'Why do you persecute me?'", prestigeContext: "The Damascus road returns. The chosen instrument is being formed." },

  // EPISTLES
  "romans:8": { context: "There is therefore now no condemnation. Nothing in all creation can separate you from the love of God in Christ Jesus.", prestigeContext: "Romans 8 returns. It still holds you when nothing else does." },
  "1corinthians:13": { context: "Love is patient. Love is kind. Love bears all things. Love never ends.", prestigeContext: "Love's chapter returns. Every line is true." },
  "1corinthians:15": { context: "Christ has been raised. Death has been swallowed up in victory.", prestigeContext: "1 Corinthians 15 returns. The resurrection chapter still soars." },
  "philippians:2": { context: "Have this mind among yourselves: he emptied himself, took the form of a servant, and humbled himself to death on a cross.", prestigeContext: "The Christ hymn returns. The descent and ascent still amaze." },
  "ephesians:6": { context: "Put on the whole armor of God. Belt of truth. Breastplate of righteousness. Shield of faith.", prestigeContext: "The armor returns. You are still in the battle." },
  "hebrews:11": { context: "By faith Abel. By faith Enoch. By faith Noah. By faith Abraham. A long roll call of those who walked by faith.", prestigeContext: "The hall of faith returns. Each name is a friend." },
  "1john:4": { context: "Beloved, let us love one another, for love is from God. God is love.", prestigeContext: "1 John 4 returns. God is love — still." },

  // REVELATION
  "revelation:1": { context: "You stand on Patmos with John. A voice like a trumpet. A vision of the glorified Christ — Alpha and Omega.", prestigeContext: "Revelation 1 returns. The glorified Christ still blazes." },
  "revelation:5": { context: "A scroll. A search. No one is worthy — until a Lamb who looks slain steps forward. Heaven sings.", prestigeContext: "The Lamb returns. The new song still bursts forth." },
  "revelation:21": { context: "A new heaven and a new earth. The holy city descends. God himself wipes away every tear. Behold, I make all things new.", prestigeContext: "The new creation returns. The promise still glows." },
  "revelation:22": { context: "The river of life. The tree of life. No more night. The Spirit and the Bride say: Come.", prestigeContext: "The end returns — and is the beginning. Come, Lord Jesus." },
};

export function getChapterOverride(bookId: string, chapter: number): ChapterOverride | undefined {
  return OVERRIDES[`${bookId}:${chapter}`];
}
