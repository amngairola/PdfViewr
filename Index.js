const url = "./pdf/FirstTimeLoginGuide.pdf";

let pdfDoc = null;
let pageNum = 1;
let pageIsRendering = false;
let pageNumIsPending = null;

const scale = 1.5;
const canvas = document.querySelector("#pdf-render");
const ctx = canvas.getContext("2d");

// Render the page
const renderPage = (num) => {
  pageIsRendering = true;

  pdfDoc
    .getPage(num)
    .then((page) => {
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderCtx = {
        canvasContext: ctx,
        viewport: viewport,
      };

      return page.render(renderCtx).promise;
    })
    .then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }

      // Output current page number
      document.querySelector("#page").textContent = num;
    })
    .catch((error) => {
      console.error("Error rendering page:", error);
    });
};

// Check pages
const queueRenderPage = (num) => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

const loadPdf = () => {
  const input = document.querySelector("#input");
  const file = input.files[0];
  if (!file) {
    console.log("Please select a PDF file");
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = function () {
    const typedArray = new Uint8Array(this.result);
    const loadingTask = pdfjsLib.getDocument({ data: typedArray });
    loadingTask.promise
      .then((pdfDoc_) => {
        pdfDoc = pdfDoc_;
        document.querySelector("#page").textContent = pdfDoc.numPages;
        renderPage(pageNum);
      })
      .catch((error) => {
        console.error("Error loading PDF document:", error);
      });
  };
  fileReader.readAsArrayBuffer(file);
};

// Button events
const prev = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};
const next = () => {
  if (!pdfDoc || pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

document.querySelector("#prev-page").addEventListener("click", prev);
document.querySelector("#next-page").addEventListener("click", next);
