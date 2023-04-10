const inputDictionary = {
  'papers': {
    'text': 'Published Papers',
    'key': 'journalArticle'
  },
  'books': {
    'text': 'Published Books',
    'key': 'book'
  },
  'preprints': {
    'text': 'Unpublished Preprints',
    'key': 'preprint'
  }
}

const collectionDictionary = {
  'Allison': '4WP3VFTM',
  'Das': 'B7H9T3CL',
  'Figueroa': 'NWS858KA',
  'Metcalf': 'QPJCI5C5',
  'Perez-Rios': 'KZGAFE8P',
  'Schneble': 'QKWJ8S8D',
  'Wei': '8K8U65A2',
  'Weinacht': 'TAKWGXYL'
}

// get collection from text content of div with collection id
const collection = collectionDictionary[document.getElementById("collection").textContent]

// get reference key matches to unique ids in document
let references = []
for (key of Object.keys(inputDictionary)) {
  if (document.getElementById(key)) {
    references.push(key)
  }
}

async function populate() {
  const requestURLBase = [
    'https://api.zotero.org/groups/4947495/collections/',
    collection,
    '/items?format=json'
  ]

  const requestURL = requestURLBase.join('');
  const request = new Request(requestURL);

  const response = await fetch(request);
  const zoteroList = await response.json();

  // loop over inputDictionary keys 
  for (reference of references) {
    let itemList = checkIfItem(reference, zoteroList);
    populateHeader(reference);
    populateItems(itemList);
  }


}

function checkIfItem(refKey, obj) {
  const keyToCheck = inputDictionary[refKey]['key'];
  let outputItems = [];

  //key structure is obj[number]['data']['itemType']
  for (const item of obj) {
    if (Object.values(item.data).includes(keyToCheck)) {
      outputItems.push(item);
    }
  }

  return outputItems;
}

function populateHeader(refKey) {
  const myTextContent = inputDictionary[refKey]['text'];
  const sectionHeader = document.querySelector('section');
  const myH1 = document.createElement('h1');
  myH1.textContent = myTextContent;
  sectionHeader.appendChild(myH1);
}

function populateItems(obj) {
  const section = document.querySelector('section');

  for (const item of obj) {
    let textInfo = []
    textInfo[0] = authorFill(item);

    // if statements here for different ref styles
    // textInfo = textInfo.concat(journalFill(item))
    if (reference == 'papers') {
      textInfo = textInfo.concat(journalFill(item))
    } else if (reference == 'preprints') {
      textInfo = textInfo.concat(preprintFill(item))
    } else {
      textInfo = textInfo.concat(bookFill(item))
    }

    const entryPara = document.createElement('p');
    const titleBold = document.createElement('b');
    const linkText = document.createElement('a');
    const optionalBold = document.createElement('b');

    entryPara.textContent = textInfo[0]
    titleBold.textContent = textInfo[1]
    linkText.textContent = textInfo[2]
    linkText.href = textInfo[3]
    optionalBold.textContent = textInfo[4]
    let suffixText = textInfo[5]

    section.appendChild(entryPara);
    entryPara.appendChild(titleBold);
    entryPara.appendChild(linkText);
    entryPara.appendChild(optionalBold);
    entryPara.append(suffixText);

  }
}

function authorFill(obj) {
  const creatorList = obj['data']['creators'];
  const maxLength = 5;
  let authorList = [];

  for (const authorEntry of creatorList) {
    author = authorEntry.firstName + ' ' + authorEntry.lastName
    authorList.push(author)
  }

  let joinedAuthor = '';
  if (authorList.length > maxLength) {
    authorList.length = maxLength;
    let lastAuthor = authorList.pop();
    authorList.push(' and ' + lastAuthor + ' et al.');
    joinedAuthor = authorList.join(', ');
  } else if (authorList.length == 2) {
    let lastAuthor = authorList.pop();
    authorList.push(' and ' + lastAuthor);
    joinedAuthor = authorList.join(' ');
  } else if (authorList.length == 1) {
    let lastAuthor = authorList.pop();
    authorList.push(lastAuthor);
    joinedAuthor = authorList.join(' ');
  } else {
    let lastAuthor = authorList.pop();
    authorList.push(' and ' + lastAuthor);
    joinedAuthor = authorList.join(', ');
  }
  return joinedAuthor + ', ';
}

function journalFill(obj) {
  const titleString = obj['data']['title'];
  const journalAbbrev = obj['data']['journalAbbreviation'];
  const journalVolume = obj['data']['volume']
  const journalIssue = obj['data']['issue']
  const journalPages = obj['data']['pages']
  const journalDate = obj['data']['date'].slice(0, 4);
  const journalURL = obj['data']['url']

  const titleText = titleString + ', '
  const journalString = journalAbbrev + ' ' + journalVolume + ', ' + journalIssue + ' ' + journalPages + ' (' + journalDate + ') '

  //formatted as a length = 5 array for consistency with other reference types
  let journalInfo = [titleText, journalString, journalURL, '', ''];

  return journalInfo;
}

function preprintFill(obj) {
  // Authors, Title, Link(arXiv Number), [Subject], Year
  const titleString = obj['data']['title'];
  const preprintFullCite = obj['data']['extra'].split(' ');
  const preprintURL = obj['data']['url'];
  const preprintDateYear = obj['data']['date'].slice(0, 4);

  const titleText = titleString + ', '
  const preprintCite = preprintFullCite[0] + ' ';
  const preprintSubject = preprintFullCite[1] + ' ';
  const preprintDate = '(' + preprintDateYear + ')';

  //formatted as a length = 5 array for consistency with other reference types
  let preprintInfo = [titleText, preprintCite, preprintURL, preprintSubject, preprintDate];
  
  return preprintInfo;
}

function bookFill(obj) {
  // Authors, Title, Link(Publisher), Year 
  const titleString = obj['data']['title'];
  const bookPublisher = obj['data']['publisher'];
  const bookURL = obj['data']['url'];
  const bookDateYear = obj['data']['date'].slice(0, 4);

  const titleText = titleString + ', ';
  const bookPublisherText = bookPublisher + ', ';
  const bookDate = '(' + bookDateYear + ')';

  //formatted as a length = 5 array for consistency with other reference types
  let bookInfo = [titleText, bookPublisherText, bookURL, '', bookDate]

  return bookInfo;
}

populate()