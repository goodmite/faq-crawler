const puppeteer = require("puppeteer");

async function scrape(url, eventCb) {
  const browser = await puppeteer.launch({
    headless: true,
    devtools: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  eventCb({ name: "process_started", data: null });
  const page = await browser.newPage();

  await page.goto(url);
  eventCb({ name: "webpage_opened", data: null });

  let [questionsFound, answerObj] = await page.evaluate(async () => {
    // START
    

    function findTextNodesWithQuestionMark(node, result = []) {
      if (node.nodeType === Node.TEXT_NODE) {
        const parentNodeName = node.parentNode.nodeName.toLowerCase();
        const parent = ['div', 'strong', 'span', 'a', 'li', 'h1', 'h2', 'h2', 'h3', 'h4', 'h5', 'h6', "button"]
        if (parent.find(e => e=== parentNodeName)) {
          if (node.textContent.includes('?')) {
            result.push(node);
          }
        }
      } else if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          findTextNodesWithQuestionMark(node.childNodes[i], result);
        }
      }
      return result;
    }

    function removeNodesByNames(mainElement, nodeNames) {
      nodeNames.forEach(node => {
        mainElement.querySelectorAll(node.toLowerCase()).forEach(e => e.parentElement.removeChild(e))
      })
      
    // // Check if the node exists and is an element node
    // if (node && node.nodeType === Node.ELEMENT_NODE) {
    //     // Check if the node's name matches any of the given node names
    //     de
    //     if (nodeNames.find(e => e.toLowerCase() === node.nodeName.toLowerCase())) {
    //         // Remove the node
    //         node.parentNode.removeChild(node);
    //     } else {
    //         // Recursively remove nodes from children
    //         const children = node.childNodes;
    //         for (let i = 0; i < children.length; i++) {
    //             removeNodesByNames(children[i], nodeNames);
    //         }
    //     }
    // }
}

    function removeInlineStyles(node) {
    // Check if the node exists and is an element node
    if (node && node.nodeType === Node.ELEMENT_NODE) {
        // Remove inline styles from the current node
        node.removeAttribute('style');
        node.removeAttribute('class');

        // Recursively remove inline styles from children nodes
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
            removeInlineStyles(children[i]);
        }
    }
}


    function getHTMLBetweenNodes(node1, node2) {
      if (!node1 || !node2) {
        throw new Error("One or both nodes are not provided.");
      }

      // Create a new range
      let range = document.createRange();

      // Set the range start to the end of node1
      range.setStartAfter(node1);

      // Set the range end to the start of node2
      range.setEndBefore(node2);

      // Extract the contents of the range
      let fragment = range.cloneContents();

      // Create a temporary container to hold the HTML
      let tempDiv = document.createElement('div');
      tempDiv.appendChild(fragment);

      // Get the innerHTML of the temporary container and trim any leading/trailing whitespace
      let htmlBetween = tempDiv;
      removeNodesByNames(htmlBetween, ["BUTTON", "IMG", "iframe"]);
      removeInlineStyles(htmlBetween)
      return htmlBetween;
    }
    function removeNewlineAndTab(inputString) {
      // Use a regular expression to replace newline and tab characters with an empty string
      return inputString.replace(/[\n\t]/g, '');
    }
    function removeMultipleSpaces(str = "") {
    // Use a regular expression to replace multiple spaces with a single space
    return str.replace(/\s{2,}/g, ' ');
}
    function removeTagsExceptWhiteListed(htmlString = "", whitelist = []) {
      htmlString = removeNewlineAndTab(htmlString);
      htmlString = htmlString.trim();
      // Construct a regular expression pattern to match all tags except those in the whitelist
      const whitelistPattern = whitelist.length > 0 ? `(?!\/?(?:${whitelist.join('|')})(?=>|\s.*>))` : '';

      // Use the pattern to remove all HTML tags except those in the whitelist
      return htmlString.replace(new RegExp(`<${whitelistPattern}\/?.*?>`, 'g'), '').trim();
    }

  
    // select all text nodes with question mark with parents div, span, a, strong, 

    const textNodes = findTextNodesWithQuestionMark(document.querySelector('main') || document.body);
    const res = [];
    for(let i = 0; i < textNodes.length - 1; ++i){
      res.push(getHTMLBetweenNodes(textNodes[i].parentNode, textNodes[i+1].parentNode));
    }
    
    const final = textNodes.map((e, i) => {
      return {
        question: e.parentNode.textContent?.trim(),
        answer: removeMultipleSpaces(res[i]?.innerHTML),//removeTagsExceptWhiteListed(res[i]?.innerHTML, ['a', 'li', 'strong', 'i', 'em']),
        plain: removeMultipleSpaces(removeTagsExceptWhiteListed(res[i]?.textContent, []))
      }
    })
    
    // END
    return Promise.resolve(['obj', final]);
  });

  


  eventCb({ name: "got_all", data: { questionsFound, answerObj } });
  browser.close();
  return { questionsFound, answerObj };
}


 module.exports =  { scrape };