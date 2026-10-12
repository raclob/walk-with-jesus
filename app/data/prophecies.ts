export type ProphecyType = "verse" | "chapter";

export interface FulfillmentRef {
  bookId: string;
  chapter: number;
  description: string;
}

export interface VerseRange {
  start: number;
  end: number;
}

export interface Prophecy {
  id: string;
  title: string;
  summary: string;
  sourceBookId: string;
  sourceChapter: number;
  type: ProphecyType;
  glowingPhrase?: string;
  /** Explicit 1-indexed verse number in sourceChapter for the inline highlight. */
  verse?: number;
  /** Explicit 1-indexed verse range (inclusive) when the phrase spans multiple verses. */
  verses?: VerseRange;
  fulfillments: FulfillmentRef[];
}

export const PROPHECIES: Prophecy[] = [
  // GENESIS
  { id: "p001", title: "The Seed of the Woman", summary: "From the very first sin, God promises that the offspring of the woman will crush the serpent's head.", sourceBookId: "genesis", sourceChapter: 3, type: "verse", glowingPhrase: "He shall bruise your head, and you shall bruise his heel.", verse: 15,
    fulfillments: [{ bookId: "matthew", chapter: 27, description: "Christ crushes the serpent through his death and resurrection." }, { bookId: "revelation", chapter: 12, description: "The dragon is finally defeated." }] },
  { id: "p002", title: "Blessing to All Nations", summary: "God promises Abraham that through his offspring, all nations on earth will be blessed.", sourceBookId: "genesis", sourceChapter: 12, type: "verse", glowingPhrase: "In you all the families of the earth shall be blessed.", verse: 3,
    fulfillments: [{ bookId: "galatians", chapter: 3, description: "Paul reveals Christ as the promised offspring through whom all nations are blessed." }] },
  { id: "p003", title: "The Scepter from Judah", summary: "Jacob prophesies that the scepter — the kingly line — shall not depart from Judah until Shiloh comes.", sourceBookId: "genesis", sourceChapter: 49, type: "verse", glowingPhrase: "The scepter shall not depart from Judah, nor the ruler's staff from between his feet.", verse: 10,
    fulfillments: [{ bookId: "matthew", chapter: 1, description: "Jesus is born in the line of Judah." }, { bookId: "revelation", chapter: 5, description: "The Lion of the tribe of Judah opens the scroll." }] },
  { id: "p004", title: "Joseph's Dreams of Sheaves and Stars", summary: "Joseph dreams that his brothers' sheaves and the stars will bow to him — a prophecy fulfilled when his family bows in Egypt.", sourceBookId: "genesis", sourceChapter: 37, type: "chapter",
    fulfillments: [{ bookId: "genesis", chapter: 42, description: "Joseph's brothers bow before him in Egypt, fulfilling his dreams." }] },

  // EXODUS / DEUTERONOMY
  { id: "p005", title: "The Passover Lamb", summary: "Israel is told to slaughter a lamb without blemish and mark their doors with its blood — a foreshadowing of the Lamb of God.", sourceBookId: "exodus", sourceChapter: 12, type: "chapter",
    fulfillments: [{ bookId: "john", chapter: 19, description: "Jesus, the Lamb of God, is crucified at Passover." }, { bookId: "1corinthians", chapter: 5, description: "Christ our Passover is sacrificed for us." }] },
  { id: "p006", title: "The Bronze Serpent Lifted Up", summary: "Moses lifts a bronze serpent in the wilderness so the dying may look and live.", sourceBookId: "numbers", sourceChapter: 21, type: "verse", glowingPhrase: "And every one that is bitten, when he looks upon it, shall live.", verse: 8,
    fulfillments: [{ bookId: "john", chapter: 3, description: "Jesus says the Son of Man must be lifted up just as the serpent was — that whoever believes in him may have eternal life." }] },
  { id: "p007", title: "A Prophet Like Moses", summary: "Moses promises that God will raise up a prophet like him from among the people — they must listen to him.", sourceBookId: "deuteronomy", sourceChapter: 18, type: "verse", glowingPhrase: "The Lord your God will raise up for you a Prophet like me.", verse: 15,
    fulfillments: [{ bookId: "acts", chapter: 3, description: "Peter declares Jesus to be the prophet Moses foretold." }] },
  { id: "p008", title: "Star Out of Jacob", summary: "Balaam, against his will, prophesies that a star will come out of Jacob — a king who will crush all enemies.", sourceBookId: "numbers", sourceChapter: 24, type: "verse", glowingPhrase: "A Star shall come out of Jacob; a Scepter shall rise out of Israel.", verse: 17,
    fulfillments: [{ bookId: "matthew", chapter: 2, description: "A star leads the magi to the newborn King of the Jews." }] },

  // 2 SAMUEL — DAVIDIC COVENANT
  { id: "p009", title: "The Davidic Covenant", summary: "God promises David that his throne will be established forever through his offspring.", sourceBookId: "2samuel", sourceChapter: 7, type: "verse", glowingPhrase: "Your throne shall be established forever.", verse: 16,
    fulfillments: [{ bookId: "luke", chapter: 1, description: "Gabriel tells Mary her son will receive the throne of his father David and reign forever." }] },

  // PSALMS
  { id: "p010", title: "The Anointed Son", summary: "The kings of the earth conspire against the Lord and his Anointed — yet God installs his Son as King on Zion.", sourceBookId: "psalms", sourceChapter: 2, type: "chapter",
    fulfillments: [{ bookId: "acts", chapter: 4, description: "The early church identifies Jesus as the Anointed One spoken of in Psalm 2." }, { bookId: "revelation", chapter: 19, description: "Christ returns as King of kings to rule the nations." }] },
  { id: "p011", title: "My God, Why Have You Forsaken Me?", summary: "David's psalm of suffering — pierced hands and feet, garments divided by lot — pictures the crucifixion centuries before it happens.", sourceBookId: "psalms", sourceChapter: 22, type: "chapter",
    fulfillments: [{ bookId: "matthew", chapter: 27, description: "Jesus quotes the opening line from the cross. Soldiers cast lots for his garments." }, { bookId: "john", chapter: 19, description: "John records the piercing of his hands, feet, and side." }] },
  { id: "p012", title: "Not Abandoned to the Grave", summary: "David sings that God's Holy One will not see corruption.", sourceBookId: "psalms", sourceChapter: 16, type: "verse", glowingPhrase: "You will not abandon my soul to Sheol, or let your holy one see corruption.", verse: 10,
    fulfillments: [{ bookId: "acts", chapter: 2, description: "Peter declares this prophecy fulfilled in Christ's resurrection." }] },
  { id: "p013", title: "A Priest Forever", summary: "A mysterious figure — both king and priest — will arise after the order of Melchizedek.", sourceBookId: "psalms", sourceChapter: 110, type: "verse", glowingPhrase: "You are a priest forever after the order of Melchizedek.", verse: 4,
    fulfillments: [{ bookId: "hebrews", chapter: 7, description: "Christ is identified as the eternal high priest in Melchizedek's order." }] },
  { id: "p014", title: "The Stone the Builders Rejected", summary: "A rejected stone becomes the cornerstone — a foundational image of the Messiah.", sourceBookId: "psalms", sourceChapter: 118, type: "verse", glowingPhrase: "The stone that the builders rejected has become the cornerstone.", verse: 22,
    fulfillments: [{ bookId: "matthew", chapter: 21, description: "Jesus applies this directly to himself before his crucifixion." }, { bookId: "1peter", chapter: 2, description: "Peter applies it to Christ as the chosen and precious cornerstone." }] },
  { id: "p015", title: "They Hated Me Without Cause", summary: "The psalmist is hated without reason — words Jesus would later apply to himself.", sourceBookId: "psalms", sourceChapter: 69, type: "verse", glowingPhrase: "They hated me without a cause.", verse: 4,
    fulfillments: [{ bookId: "john", chapter: 15, description: "Jesus quotes this psalm to his disciples about the world's hatred." }] },

  // ISAIAH
  { id: "p016", title: "Immanuel — God With Us", summary: "Isaiah promises a sign: a virgin will conceive and bear a son, and his name will be Immanuel.", sourceBookId: "isaiah", sourceChapter: 7, type: "verse", glowingPhrase: "Behold, the virgin shall conceive and bear a son, and shall call his name Immanuel.", verse: 14,
    fulfillments: [{ bookId: "matthew", chapter: 1, description: "An angel tells Joseph this prophecy is fulfilled in Mary's son." }] },
  { id: "p017", title: "Wonderful Counselor, Mighty God", summary: "A child will be born whose government and peace will have no end — Wonderful Counselor, Mighty God, Everlasting Father, Prince of Peace.", sourceBookId: "isaiah", sourceChapter: 9, type: "verse", glowingPhrase: "For to us a child is born, to us a son is given.", verse: 6,
    fulfillments: [{ bookId: "luke", chapter: 2, description: "Jesus is born in Bethlehem and the angels announce peace on earth." }] },
  { id: "p018", title: "A Shoot from Jesse's Stump", summary: "From Jesse's withered family tree a fresh branch will spring — bearing the Spirit of the Lord.", sourceBookId: "isaiah", sourceChapter: 11, type: "chapter",
    fulfillments: [{ bookId: "matthew", chapter: 1, description: "Matthew traces Jesus' lineage through Jesse to David." }, { bookId: "revelation", chapter: 22, description: "Christ identifies himself as the Root and Offspring of David." }] },
  { id: "p019", title: "The Voice in the Wilderness", summary: "A voice crying out in the wilderness will prepare the way for the Lord.", sourceBookId: "isaiah", sourceChapter: 40, type: "verse", glowingPhrase: "Prepare the way of the Lord; make straight in the desert a highway for our God.", verse: 3,
    fulfillments: [{ bookId: "matthew", chapter: 3, description: "John the Baptist appears in the wilderness as the foretold voice." }, { bookId: "luke", chapter: 3, description: "Luke explicitly identifies John as Isaiah's voice." }] },
  { id: "p020", title: "The Servant Bringing Light to Gentiles", summary: "God's chosen Servant will bring light to the Gentiles and salvation to the ends of the earth.", sourceBookId: "isaiah", sourceChapter: 42, type: "chapter",
    fulfillments: [{ bookId: "matthew", chapter: 12, description: "Matthew identifies Jesus as the gentle servant Isaiah described." }, { bookId: "luke", chapter: 2, description: "Simeon recognizes the infant Jesus as 'a light to the Gentiles.'" }] },
  { id: "p021", title: "The Suffering Servant", summary: "A man of sorrows, despised and rejected, will be pierced for our transgressions and crushed for our iniquities — by his wounds we are healed.", sourceBookId: "isaiah", sourceChapter: 53, type: "chapter",
    fulfillments: [{ bookId: "matthew", chapter: 27, description: "Jesus is crucified silently, like a lamb led to slaughter." }, { bookId: "1peter", chapter: 2, description: "Peter applies Isaiah 53 directly to Christ — by his wounds we are healed." }, { bookId: "acts", chapter: 8, description: "Philip explains Isaiah 53 to the Ethiopian eunuch and proclaims Jesus." }] },
  { id: "p022", title: "Anointed to Proclaim Good News", summary: "The Spirit of the Lord is upon the anointed one, sent to bring good news to the poor and freedom to the captives.", sourceBookId: "isaiah", sourceChapter: 61, type: "verse", glowingPhrase: "The Spirit of the Lord God is upon me, because the Lord has anointed me.", verse: 1,
    fulfillments: [{ bookId: "luke", chapter: 4, description: "Jesus reads this passage in the synagogue and declares it fulfilled in their hearing." }] },
  { id: "p023", title: "New Heavens and New Earth", summary: "God will create new heavens and a new earth where the former things are not remembered.", sourceBookId: "isaiah", sourceChapter: 65, type: "verse", glowingPhrase: "I create new heavens and a new earth.", verse: 17,
    fulfillments: [{ bookId: "2peter", chapter: 3, description: "Peter awaits the new heavens and new earth where righteousness dwells." }, { bookId: "revelation", chapter: 21, description: "John sees the new heaven and new earth where God dwells with man." }] },

  // JEREMIAH
  { id: "p024", title: "The New Covenant", summary: "God promises a new covenant — written on hearts, not stone — with sins remembered no more.", sourceBookId: "jeremiah", sourceChapter: 31, type: "verse", glowingPhrase: "I will put my law within them, and I will write it on their hearts.", verse: 33,
    fulfillments: [{ bookId: "luke", chapter: 22, description: "Jesus institutes the cup of the new covenant in his blood." }, { bookId: "hebrews", chapter: 8, description: "Hebrews quotes Jeremiah 31 in full to declare the new covenant in Christ." }] },
  { id: "p025", title: "Seventy Years of Exile", summary: "Jeremiah prophesies that the exile in Babylon will last seventy years — then God will bring his people home.", sourceBookId: "jeremiah", sourceChapter: 25, type: "chapter",
    fulfillments: [{ bookId: "ezra", chapter: 1, description: "After seventy years, Cyrus sends the exiles home — exactly as Jeremiah said." }, { bookId: "daniel", chapter: 9, description: "Daniel reads Jeremiah's prophecy and prays at exactly the right moment." }] },
  { id: "p026", title: "The Righteous Branch", summary: "A righteous Branch will spring from David — a King who will reign wisely and bring justice.", sourceBookId: "jeremiah", sourceChapter: 23, type: "verse", glowingPhrase: "I will raise up for David a righteous Branch.", verse: 5,
    fulfillments: [{ bookId: "matthew", chapter: 1, description: "Jesus is born in David's line as the promised Branch." }] },

  // EZEKIEL
  { id: "p027", title: "A New Heart and a New Spirit", summary: "God promises to give his people a new heart and put his Spirit within them.", sourceBookId: "ezekiel", sourceChapter: 36, type: "verse", glowingPhrase: "I will give you a new heart, and a new spirit I will put within you.", verse: 26,
    fulfillments: [{ bookId: "acts", chapter: 2, description: "The Spirit is poured out at Pentecost." }, { bookId: "2corinthians", chapter: 5, description: "Anyone in Christ is a new creation." }] },
  { id: "p028", title: "The Valley of Dry Bones", summary: "Ezekiel sees a valley of dry bones brought back to life — a vision of resurrection and restoration.", sourceBookId: "ezekiel", sourceChapter: 37, type: "chapter",
    fulfillments: [{ bookId: "romans", chapter: 11, description: "Paul speaks of Israel's restoration as 'life from the dead.'" }, { bookId: "revelation", chapter: 20, description: "The dead are raised at the resurrection." }] },
  { id: "p029", title: "One Shepherd for the Flock", summary: "God promises to set one shepherd — David his servant — over the flock.", sourceBookId: "ezekiel", sourceChapter: 34, type: "verse", glowingPhrase: "I will set up over them one shepherd, my servant David.", verse: 23,
    fulfillments: [{ bookId: "john", chapter: 10, description: "Jesus declares himself the Good Shepherd, the Son of David." }] },

  // DANIEL
  { id: "p030", title: "The Stone Cut Without Hands", summary: "Daniel interprets Nebuchadnezzar's dream: a stone cut without hands will crush all earthly kingdoms and become a mountain that fills the earth.", sourceBookId: "daniel", sourceChapter: 2, type: "chapter",
    fulfillments: [{ bookId: "matthew", chapter: 16, description: "Jesus declares that he will build his church and the gates of hell will not prevail." }, { bookId: "revelation", chapter: 11, description: "The kingdom of the world becomes the kingdom of our Lord and his Christ." }] },
  { id: "p031", title: "The Son of Man Coming on the Clouds", summary: "Daniel sees one like a son of man coming on the clouds, given dominion and an everlasting kingdom.", sourceBookId: "daniel", sourceChapter: 7, type: "chapter",
    fulfillments: [{ bookId: "matthew", chapter: 26, description: "At his trial, Jesus identifies himself as the Son of Man from Daniel's vision." }, { bookId: "revelation", chapter: 1, description: "John sees the glorified Christ as one like a son of man." }] },
  { id: "p032", title: "Seventy Weeks Decreed", summary: "Daniel is told of seventy weeks decreed for atonement, the coming of the Anointed One, and his being cut off.", sourceBookId: "daniel", sourceChapter: 9, type: "chapter",
    fulfillments: [{ bookId: "luke", chapter: 23, description: "The Anointed One is 'cut off' on the cross." }] },

  // HOSEA / JOEL / AMOS / JONAH
  { id: "p033", title: "Out of Egypt I Called My Son", summary: "God recalls calling his son out of Egypt — a verse Matthew sees fulfilled in the Christ child.", sourceBookId: "hosea", sourceChapter: 11, type: "verse", glowingPhrase: "Out of Egypt I called my son.", verse: 1,
    fulfillments: [{ bookId: "matthew", chapter: 2, description: "Jesus' return from Egypt fulfills Hosea's words." }] },
  { id: "p034", title: "I Will Pour Out My Spirit", summary: "Joel promises a day when God will pour out his Spirit on all flesh — sons and daughters will prophesy.", sourceBookId: "joel", sourceChapter: 2, type: "verse", glowingPhrase: "I will pour out my Spirit on all flesh.", verse: 28,
    fulfillments: [{ bookId: "acts", chapter: 2, description: "Peter declares Joel's prophecy fulfilled at Pentecost." }] },
  { id: "p035", title: "The Tabernacle of David Restored", summary: "Amos foretells the rebuilding of David's fallen tabernacle so that all nations may seek the Lord.", sourceBookId: "amos", sourceChapter: 9, type: "verse", glowingPhrase: "I will raise up the tabernacle of David that is fallen.", verse: 11,
    fulfillments: [{ bookId: "acts", chapter: 15, description: "James cites Amos at the Jerusalem Council to confirm Gentile inclusion." }] },
  { id: "p036", title: "The Sign of Jonah", summary: "Jonah is in the great fish for three days and three nights — a sign Jesus would later claim for himself.", sourceBookId: "jonah", sourceChapter: 1, type: "chapter",
    fulfillments: [{ bookId: "matthew", chapter: 12, description: "Jesus says no sign will be given but the sign of Jonah." }] },

  // MICAH / ZECHARIAH / MALACHI
  { id: "p037", title: "Born in Bethlehem", summary: "Micah prophesies that a ruler will come from Bethlehem, a small town in Judah, whose origin is from of old.", sourceBookId: "micah", sourceChapter: 5, type: "verse", glowingPhrase: "But you, O Bethlehem Ephrathah, who are too little to be among the clans of Judah.", verse: 2,
    fulfillments: [{ bookId: "matthew", chapter: 2, description: "Herod's scribes quote Micah 5 to identify Bethlehem as the Messiah's birthplace." }, { bookId: "luke", chapter: 2, description: "Jesus is born in Bethlehem during the census." }] },
  { id: "p038", title: "What Does the Lord Require?", summary: "Micah names what is good — to do justly, love mercy, and walk humbly with God.", sourceBookId: "micah", sourceChapter: 6, type: "verse", glowingPhrase: "Do justly, love mercy, and walk humbly with your God.", verse: 8,
    fulfillments: [{ bookId: "matthew", chapter: 23, description: "Jesus calls out the religious leaders for neglecting justice, mercy, and faithfulness." }] },
  { id: "p039", title: "The King on a Donkey", summary: "Zechariah foretells the king coming to Jerusalem riding on a donkey — humble and bringing salvation.", sourceBookId: "zechariah", sourceChapter: 9, type: "verse", glowingPhrase: "Your king is coming to you, righteous and having salvation, humble and mounted on a donkey.", verse: 9,
    fulfillments: [{ bookId: "matthew", chapter: 21, description: "Jesus enters Jerusalem on a donkey on Palm Sunday." }, { bookId: "john", chapter: 12, description: "John explicitly cites Zechariah at the triumphal entry." }] },
  { id: "p040", title: "Thirty Pieces of Silver", summary: "Zechariah's strange image: a shepherd valued at thirty pieces of silver, thrown into the temple.", sourceBookId: "zechariah", sourceChapter: 11, type: "verse", glowingPhrase: "So they weighed out as my wages thirty pieces of silver.", verse: 12,
    fulfillments: [{ bookId: "matthew", chapter: 27, description: "Judas throws the thirty pieces of silver into the temple after betraying Jesus." }] },
  { id: "p041", title: "They Will Look on Him Whom They Pierced", summary: "Zechariah foretells a day when Israel will look on the one they have pierced and mourn.", sourceBookId: "zechariah", sourceChapter: 12, type: "verse", glowingPhrase: "They shall look on me, on him whom they have pierced.", verse: 10,
    fulfillments: [{ bookId: "john", chapter: 19, description: "John quotes Zechariah after Jesus is pierced on the cross." }, { bookId: "revelation", chapter: 1, description: "Every eye will see him, even those who pierced him." }] },
  { id: "p042", title: "The Messenger Who Prepares the Way", summary: "Malachi promises a messenger who will prepare the way before the Lord.", sourceBookId: "malachi", sourceChapter: 3, type: "verse", glowingPhrase: "Behold, I send my messenger, and he will prepare the way before me.", verse: 1,
    fulfillments: [{ bookId: "matthew", chapter: 11, description: "Jesus identifies John the Baptist as the messenger Malachi spoke of." }] },
  { id: "p043", title: "Elijah Will Come First", summary: "Malachi promises that Elijah will come before the great day of the Lord.", sourceBookId: "malachi", sourceChapter: 4, type: "verse", glowingPhrase: "Behold, I will send you Elijah the prophet.", verse: 5,
    fulfillments: [{ bookId: "matthew", chapter: 17, description: "Jesus says John the Baptist came in the spirit of Elijah." }] },
  { id: "p044", title: "The Sun of Righteousness", summary: "For those who fear God, the sun of righteousness will rise with healing in its wings.", sourceBookId: "malachi", sourceChapter: 4, type: "verse", glowingPhrase: "The sun of righteousness shall rise with healing in its wings.", verse: 2,
    fulfillments: [{ bookId: "luke", chapter: 1, description: "Zechariah's song calls Christ the dawn that has visited from on high." }] },

  // JESUS' OWN PROPHECIES
  { id: "p045", title: "Destroy This Temple", summary: "Jesus says if they destroy 'this temple,' he will raise it again in three days — speaking of his body.", sourceBookId: "john", sourceChapter: 2, type: "verse", glowingPhrase: "Destroy this temple, and in three days I will raise it up.", verse: 19,
    fulfillments: [{ bookId: "john", chapter: 20, description: "Jesus rises on the third day, just as he said." }] },
  { id: "p046", title: "Peter's Denial Foretold", summary: "Jesus tells Peter that before the rooster crows, Peter will deny him three times.", sourceBookId: "matthew", sourceChapter: 26, type: "verse", glowingPhrase: "Before the rooster crows, you will deny me three times.", verse: 34,
    fulfillments: [{ bookId: "matthew", chapter: 26, description: "Peter denies Jesus three times before the rooster crows." }, { bookId: "luke", chapter: 22, description: "Luke records the rooster crowing and Peter remembering Jesus' words." }] },
  { id: "p047", title: "The Son of Man Must Suffer", summary: "Jesus repeatedly tells his disciples that he must go to Jerusalem, suffer, be killed, and rise on the third day.", sourceBookId: "matthew", sourceChapter: 16, type: "verse", glowingPhrase: "He must go to Jerusalem and suffer many things... and be killed, and on the third day be raised.", verse: 21,
    fulfillments: [{ bookId: "matthew", chapter: 28, description: "Jesus rises on the third day exactly as he predicted." }] },
  { id: "p048", title: "Not One Stone Left", summary: "Jesus prophesies that the temple will be destroyed — not one stone left on another.", sourceBookId: "matthew", sourceChapter: 24, type: "chapter",
    fulfillments: [{ bookId: "luke", chapter: 21, description: "Luke records the same prophecy in detail. The temple was destroyed in AD 70." }] },
  { id: "p049", title: "The Promise of the Comforter", summary: "Jesus promises to send the Holy Spirit, the Helper, who will guide his disciples into all truth.", sourceBookId: "john", sourceChapter: 14, type: "verse", glowingPhrase: "I will ask the Father, and he will give you another Helper, to be with you forever.", verse: 16,
    fulfillments: [{ bookId: "acts", chapter: 2, description: "The Spirit descends at Pentecost as Jesus promised." }] },
  { id: "p050", title: "I Go to Prepare a Place", summary: "Jesus promises his disciples that he is going to prepare a place for them, and will come again to receive them.", sourceBookId: "john", sourceChapter: 14, type: "verse", glowingPhrase: "I go to prepare a place for you. And if I go... I will come again.", verses: { start: 2, end: 3 },
    fulfillments: [{ bookId: "revelation", chapter: 21, description: "John sees the New Jerusalem coming down — the dwelling place Jesus prepared." }] },
  { id: "p051", title: "Witnesses to the Ends of the Earth", summary: "Jesus tells his disciples they will be his witnesses in Jerusalem, Judea, Samaria, and to the ends of the earth.", sourceBookId: "acts", sourceChapter: 1, type: "verse", glowingPhrase: "You will be my witnesses... to the end of the earth.", verse: 8,
    fulfillments: [{ bookId: "acts", chapter: 28, description: "Paul reaches Rome — the gospel has gone to the ends of the empire." }] },
  { id: "p052", title: "The Great Commission", summary: "Jesus commissions his disciples to go and make disciples of all nations.", sourceBookId: "matthew", sourceChapter: 28, type: "verse", glowingPhrase: "Go therefore and make disciples of all nations.", verse: 19,
    fulfillments: [{ bookId: "acts", chapter: 13, description: "Paul and Barnabas are sent out as the first missionaries to the Gentiles." }] },

  // EPISTLES PROPHECIES
  { id: "p053", title: "The Mystery of the Rapture", summary: "Paul reveals a mystery — the dead in Christ will rise first, and the living will be caught up to meet the Lord in the air.", sourceBookId: "1thessalonians", sourceChapter: 4, type: "chapter",
    fulfillments: [{ bookId: "revelation", chapter: 20, description: "John sees the resurrection of the saints." }] },
  { id: "p054", title: "Every Knee Will Bow", summary: "Paul declares that at Jesus' name every knee will bow and every tongue confess that he is Lord.", sourceBookId: "philippians", sourceChapter: 2, type: "verse", glowingPhrase: "Every knee should bow... and every tongue confess that Jesus Christ is Lord.", verse: 11,
    fulfillments: [{ bookId: "revelation", chapter: 5, description: "Every creature in heaven and on earth worships the Lamb." }] },
  { id: "p055", title: "Death Swallowed in Victory", summary: "Paul prophesies that at the resurrection, death will be swallowed up in victory.", sourceBookId: "1corinthians", sourceChapter: 15, type: "verse", glowingPhrase: "Death is swallowed up in victory.", verse: 54,
    fulfillments: [{ bookId: "revelation", chapter: 21, description: "Death itself is destroyed; God wipes every tear away." }] },
  { id: "p056", title: "The Day of the Lord Like a Thief", summary: "The day of the Lord will come like a thief in the night.", sourceBookId: "1thessalonians", sourceChapter: 5, type: "verse", glowingPhrase: "The day of the Lord will come like a thief in the night.", verse: 2,
    fulfillments: [{ bookId: "2peter", chapter: 3, description: "Peter echoes Paul: the day of the Lord will come like a thief." }, { bookId: "revelation", chapter: 16, description: "Christ himself says, 'Behold, I am coming like a thief.'" }] },
  { id: "p057", title: "Falling Away Before the Day", summary: "Paul warns of a great falling away and the man of lawlessness before the day of the Lord.", sourceBookId: "2thessalonians", sourceChapter: 2, type: "chapter",
    fulfillments: [{ bookId: "revelation", chapter: 13, description: "John sees a beast empowered to deceive and persecute." }] },

  // REVELATION POINTING BACK
  { id: "p058", title: "I Am the Alpha and the Omega", summary: "Christ declares himself the beginning and the end — fulfilling every promise from Genesis to Revelation.", sourceBookId: "revelation", sourceChapter: 1, type: "verse", glowingPhrase: "I am the Alpha and the Omega.", verse: 8,
    fulfillments: [{ bookId: "revelation", chapter: 22, description: "Christ repeats the declaration at the very end — he is the first and the last." }] },
  { id: "p059", title: "The Lamb on the Throne", summary: "John sees the slain Lamb worthy to open the scroll — the only one able to redeem the world.", sourceBookId: "revelation", sourceChapter: 5, type: "chapter",
    fulfillments: [{ bookId: "revelation", chapter: 22, description: "The throne of God and of the Lamb stands at the center of the new creation." }] },
  { id: "p060", title: "A Multitude from Every Nation", summary: "John sees a great multitude from every nation, tribe, and language standing before the throne.", sourceBookId: "revelation", sourceChapter: 7, type: "chapter",
    fulfillments: [{ bookId: "revelation", chapter: 21, description: "The nations walk by the light of the Lamb in the New Jerusalem." }] },
  { id: "p061", title: "The Marriage of the Lamb", summary: "The marriage supper of the Lamb is announced — the bride has made herself ready.", sourceBookId: "revelation", sourceChapter: 19, type: "chapter",
    fulfillments: [{ bookId: "revelation", chapter: 21, description: "The bride, the New Jerusalem, descends adorned for her husband." }] },

  // ADDITIONAL KEY PROPHECIES
  { id: "p062", title: "He Will Be Called a Nazarene", summary: "Jesus settles in Nazareth so that what was spoken by the prophets would be fulfilled.", sourceBookId: "matthew", sourceChapter: 2, type: "verse", glowingPhrase: "He shall be called a Nazarene.", verse: 23,
    fulfillments: [{ bookId: "matthew", chapter: 4, description: "Jesus is repeatedly identified as 'Jesus of Nazareth' throughout his ministry." }] },
  { id: "p063", title: "Rachel Weeping for Her Children", summary: "Jeremiah's lament over Rachel weeping is invoked when Herod slaughters the infants of Bethlehem.", sourceBookId: "jeremiah", sourceChapter: 31, type: "verse", glowingPhrase: "A voice was heard in Ramah, weeping and great mourning, Rachel weeping for her children.", verse: 15,
    fulfillments: [{ bookId: "matthew", chapter: 2, description: "Matthew quotes Jeremiah after Herod kills the children of Bethlehem." }] },
  { id: "p064", title: "Pierced Hands and Feet", summary: "The psalmist describes hands and feet pierced — centuries before crucifixion was invented.", sourceBookId: "psalms", sourceChapter: 22, type: "verse", glowingPhrase: "They have pierced my hands and feet.", verse: 16,
    fulfillments: [{ bookId: "luke", chapter: 23, description: "Jesus' hands and feet are pierced on the cross." }, { bookId: "john", chapter: 20, description: "Thomas sees the marks in his hands and side." }] },
  { id: "p065", title: "Bones Not Broken", summary: "Not one bone of the Passover lamb may be broken — fulfilled when soldiers do not break Jesus' legs.", sourceBookId: "exodus", sourceChapter: 12, type: "verse", glowingPhrase: "You shall not break any of its bones.", verse: 46,
    fulfillments: [{ bookId: "john", chapter: 19, description: "John records that the soldiers did not break Jesus' legs, fulfilling Scripture." }] },
  { id: "p066", title: "Buried with the Rich", summary: "Isaiah says the Servant's grave is assigned with the wicked, but with a rich man in his death.", sourceBookId: "isaiah", sourceChapter: 53, type: "verse", glowingPhrase: "And they made his grave with the wicked and with a rich man in his death.", verse: 9,
    fulfillments: [{ bookId: "matthew", chapter: 27, description: "Jesus is buried in the new tomb of Joseph of Arimathea, a rich man." }] },
  { id: "p067", title: "Silent Before His Accusers", summary: "Like a sheep before its shearers, the Servant opens not his mouth.", sourceBookId: "isaiah", sourceChapter: 53, type: "verse", glowingPhrase: "Like a sheep before its shearers is silent, so he opened not his mouth.", verse: 7,
    fulfillments: [{ bookId: "matthew", chapter: 27, description: "Jesus stays silent before Pilate and his accusers, to the governor's amazement." }] },
  { id: "p068", title: "Friend of Sinners and Tax Collectors", summary: "Isaiah foretells one numbered with the transgressors.", sourceBookId: "isaiah", sourceChapter: 53, type: "verse", glowingPhrase: "He was numbered with the transgressors.", verse: 12,
    fulfillments: [{ bookId: "luke", chapter: 23, description: "Jesus is crucified between two criminals, fulfilling Isaiah." }] },
  { id: "p069", title: "Gall and Vinegar to Drink", summary: "The psalmist says they gave him gall for food and vinegar to drink.", sourceBookId: "psalms", sourceChapter: 69, type: "verse", glowingPhrase: "They gave me poison for food, and for my thirst they gave me sour wine to drink.", verse: 21,
    fulfillments: [{ bookId: "matthew", chapter: 27, description: "On the cross, Jesus is offered wine mixed with gall." }, { bookId: "john", chapter: 19, description: "Jesus says 'I thirst' and is given sour wine." }] },
  { id: "p070", title: "Zeal for Your House", summary: "Zeal for God's house consumes the psalmist — words quoted by John when Jesus cleanses the temple.", sourceBookId: "psalms", sourceChapter: 69, type: "verse", glowingPhrase: "Zeal for your house has consumed me.", verse: 9,
    fulfillments: [{ bookId: "john", chapter: 2, description: "John quotes this psalm after Jesus drives out the moneychangers." }] },
  { id: "p071", title: "Riding the Storm", summary: "The psalmist depicts God walking on the sea — Jesus walks on the water in the gospels.", sourceBookId: "psalms", sourceChapter: 77, type: "verse", glowingPhrase: "Your way was through the sea, your path through the great waters.", verse: 19,
    fulfillments: [{ bookId: "matthew", chapter: 14, description: "Jesus walks on the water during the storm." }] },
  { id: "p072", title: "Speaking in Parables", summary: "Asaph's psalm declares 'I will open my mouth in parables' — a verse Matthew sees fulfilled in Jesus' teaching.", sourceBookId: "psalms", sourceChapter: 78, type: "verse", glowingPhrase: "I will open my mouth in a parable.", verse: 2,
    fulfillments: [{ bookId: "matthew", chapter: 13, description: "Jesus teaches in parables, fulfilling the psalmist." }] },
  { id: "p073", title: "The Cornerstone Laid in Zion", summary: "Isaiah promises a tested cornerstone laid in Zion — a foundation of faith.", sourceBookId: "isaiah", sourceChapter: 28, type: "verse", glowingPhrase: "Behold, I am laying in Zion a stone, a tested stone.", verse: 16,
    fulfillments: [{ bookId: "1peter", chapter: 2, description: "Peter applies this directly to Christ as the cornerstone of the church." }] },
  { id: "p074", title: "The Spirit Resting on Jesus", summary: "Isaiah promises the Spirit of the Lord — wisdom and counsel — will rest on the coming Branch.", sourceBookId: "isaiah", sourceChapter: 11, type: "verse", glowingPhrase: "The Spirit of the Lord shall rest upon him.", verse: 2,
    fulfillments: [{ bookId: "matthew", chapter: 3, description: "At Jesus' baptism, the Spirit descends and rests on him." }] },
  { id: "p075", title: "The Lamb of God", summary: "John the Baptist points to Jesus as the Lamb of God who takes away the sin of the world — recalling every sacrifice.", sourceBookId: "john", sourceChapter: 1, type: "verse", glowingPhrase: "Behold, the Lamb of God, who takes away the sin of the world.", verse: 29,
    fulfillments: [{ bookId: "revelation", chapter: 5, description: "John sees the Lamb who was slain receiving worship at the throne." }] },
  { id: "p076", title: "Born of a Woman", summary: "Paul declares that in the fullness of time God sent his Son, born of a woman, born under the law.", sourceBookId: "galatians", sourceChapter: 4, type: "verse", glowingPhrase: "When the fullness of time had come, God sent forth his Son, born of woman.", verse: 4,
    fulfillments: [{ bookId: "luke", chapter: 2, description: "Mary gives birth to Jesus — God's Son in human flesh." }] },
  { id: "p077", title: "The Day of Visitation", summary: "Jesus weeps over Jerusalem because she did not know the time of her visitation.", sourceBookId: "luke", sourceChapter: 19, type: "verse", glowingPhrase: "You did not know the time of your visitation.", verse: 44,
    fulfillments: [{ bookId: "luke", chapter: 21, description: "Jesus' prophecy of Jerusalem's destruction is fulfilled in AD 70." }] },
  { id: "p078", title: "The Suffering of the Apostles", summary: "Jesus tells his disciples they will be hated and persecuted for his name's sake.", sourceBookId: "matthew", sourceChapter: 10, type: "verse", glowingPhrase: "You will be hated by all for my name's sake.", verse: 22,
    fulfillments: [{ bookId: "acts", chapter: 7, description: "Stephen becomes the first martyr, stoned for preaching Christ." }, { bookId: "acts", chapter: 12, description: "James the apostle is killed by Herod." }] },
  { id: "p079", title: "Many Will Come in My Name", summary: "Jesus warns that many false christs and false prophets will arise.", sourceBookId: "matthew", sourceChapter: 24, type: "verse", glowingPhrase: "Many will come in my name, saying, 'I am the Christ,' and they will lead many astray.", verse: 5,
    fulfillments: [{ bookId: "1john", chapter: 2, description: "John warns that many antichrists have already come." }] },
  { id: "p080", title: "Saul Will Carry My Name", summary: "After Saul's conversion, Jesus tells Ananias that Saul is a chosen instrument to carry his name to the Gentiles.", sourceBookId: "acts", sourceChapter: 9, type: "verse", glowingPhrase: "He is a chosen instrument of mine to carry my name before the Gentiles.", verse: 15,
    fulfillments: [{ bookId: "acts", chapter: 28, description: "Paul preaches the kingdom of God in Rome — the very heart of the Gentile world." }] },
  { id: "p081", title: "Paul Will Suffer for My Name", summary: "Jesus tells Ananias that Paul will suffer many things for his name.", sourceBookId: "acts", sourceChapter: 9, type: "verse", glowingPhrase: "I will show him how much he must suffer for the sake of my name.", verse: 16,
    fulfillments: [{ bookId: "2corinthians", chapter: 11, description: "Paul lists his sufferings — beatings, shipwrecks, imprisonments — all for Christ." }] },
  { id: "p082", title: "Bound in Jerusalem", summary: "Agabus prophesies that Paul will be bound in Jerusalem and handed over to the Gentiles.", sourceBookId: "acts", sourceChapter: 21, type: "chapter",
    fulfillments: [{ bookId: "acts", chapter: 21, description: "Days later, Paul is arrested in Jerusalem just as Agabus said." }] },
  { id: "p083", title: "Paul Must Stand Before Caesar", summary: "An angel tells Paul during a storm at sea that he must stand before Caesar.", sourceBookId: "acts", sourceChapter: 27, type: "verse", glowingPhrase: "Do not be afraid, Paul; you must stand before Caesar.", verse: 24,
    fulfillments: [{ bookId: "acts", chapter: 28, description: "Paul reaches Rome and proclaims the gospel openly." }] },
  { id: "p084", title: "The Spirit and Bride Say Come", summary: "The closing pages of Scripture invite all who are thirsty to come — the final fulfillment is approach.", sourceBookId: "revelation", sourceChapter: 22, type: "verse", glowingPhrase: "The Spirit and the Bride say, 'Come.'", verse: 17,
    fulfillments: [{ bookId: "revelation", chapter: 22, description: "The book closes with the same invitation — Come, Lord Jesus." }] },
];

// Build lookup maps
export const PROPHECIES_BY_SOURCE = new Map<string, Prophecy[]>();
export const PROPHECIES_BY_FULFILLMENT = new Map<string, Prophecy[]>();

for (const p of PROPHECIES) {
  const sourceKey = `${p.sourceBookId}:${p.sourceChapter}`;
  if (!PROPHECIES_BY_SOURCE.has(sourceKey)) PROPHECIES_BY_SOURCE.set(sourceKey, []);
  PROPHECIES_BY_SOURCE.get(sourceKey)!.push(p);

  for (const f of p.fulfillments) {
    const fkey = `${f.bookId}:${f.chapter}`;
    if (!PROPHECIES_BY_FULFILLMENT.has(fkey)) PROPHECIES_BY_FULFILLMENT.set(fkey, []);
    PROPHECIES_BY_FULFILLMENT.get(fkey)!.push(p);
  }
}

export function getPropheciesAtSource(bookId: string, chapter: number): Prophecy[] {
  return PROPHECIES_BY_SOURCE.get(`${bookId}:${chapter}`) ?? [];
}

export function getPropheciesAtFulfillment(bookId: string, chapter: number): Prophecy[] {
  return PROPHECIES_BY_FULFILLMENT.get(`${bookId}:${chapter}`) ?? [];
}

export function getProphecyById(id: string): Prophecy | undefined {
  return PROPHECIES.find((p) => p.id === id);
}
