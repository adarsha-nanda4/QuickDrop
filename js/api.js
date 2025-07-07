let selectedFiles = [];

document.getElementById('fileInput').addEventListener('change', function () {
  selectedFiles = Array.from(this.files);
  showFilePreviews(selectedFiles);
});

function showFilePreviews(files) {
  const preview = document.getElementById("filePreview");
  preview.innerHTML = "";

  files.forEach((file, index) => {
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const id = `progressBar${index}`;

    preview.innerHTML += `
      <div class="file-card" id="fileCard${index}">
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${fileSizeMB} MB</div>
          <div class="progress-bar">
            <div class="progress-bar-inner" id="${id}"></div>
          </div>
        </div>
        <div class="delete-btn" onclick="removeFile(${index})">×</div>
      </div>
    `;
  });
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  showFilePreviews(selectedFiles);
}

function showSuccessMessage(message) {
  document.getElementById("successMessage").innerText = message;
}

async function uploadFile() {
  if (selectedFiles.length === 0) {
    alert("Please select at least one file to upload.");
    return;
  }

  let uploadCount = 0;

  selectedFiles.forEach((file, index) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'QuickDrop');

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/dta4ykg5a/auto/upload");

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        document.getElementById(`progressBar${index}`).style.width = percent + "%";
      }
    };

    xhr.onload = function () {
      if (xhr.status === 200) {
        document.getElementById(`progressBar${index}`).style.width = "100%";
        uploadCount++;

        // When all files are uploaded
        if (uploadCount === selectedFiles.length) {
          showSuccessMessage("✅ All files uploaded successfully!");
          setTimeout(() => window.location.reload(), 3000);
        }
      } else {
        document.getElementById(`fileCard${index}`).style.borderColor = "red";
        showSuccessMessage("❌ Some uploads failed.");
      }
    };

    xhr.onerror = function () {
      document.getElementById(`fileCard${index}`).style.borderColor = "red";
      showSuccessMessage("❌ Some uploads failed.");
    };

    xhr.send(formData);
  });
}
