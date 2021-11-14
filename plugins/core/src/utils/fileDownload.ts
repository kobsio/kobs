// fileDownload is a wrapper for the blodDownload function, but allows users to specify the data as string.
export const fileDownload = (data: string, filename: string): void => {
  const blob = new Blob([data]);
  blobDownload(blob, filename);
};

// blobDownload can be used to download the given data as file.
// See: https://github.com/kennethjiang/js-file-download
export const blobDownload = (blob: Blob, filename: string): void => {
  const blobURL =
    window.URL && window.URL.createObjectURL
      ? window.URL.createObjectURL(blob)
      : window.webkitURL.createObjectURL(blob);
  const tempLink = document.createElement('a');
  tempLink.style.display = 'none';
  tempLink.href = blobURL;
  tempLink.setAttribute('download', filename);

  if (typeof tempLink.download === 'undefined') {
    tempLink.setAttribute('target', '_blank');
  }

  document.body.appendChild(tempLink);
  tempLink.click();

  setTimeout(function () {
    document.body.removeChild(tempLink);
    window.URL.revokeObjectURL(blobURL);
  }, 200);
};
