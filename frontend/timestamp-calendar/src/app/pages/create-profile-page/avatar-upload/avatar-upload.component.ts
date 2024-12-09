import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, signal, ViewChild} from '@angular/core';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-avatar-upload',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './avatar-upload.component.html',
  styleUrl: './avatar-upload.component.scss'
})
export class AvatarUploadComponent implements OnChanges {
  @Input() avatarUrl?: string | undefined
  @Output() moveAvatarToParent = new EventEmitter<string>()
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>
  errorMessage = false
  // Default avatar image
  private defaultAvatar = "/assets/images/avatar.png"

  // Signal to hold the preview image
  preview = signal<string>(this.defaultAvatar)

  ngOnChanges(): void {
    if (this.avatarUrl) this.preview.set(this.avatarUrl)
  }

  fileBrowserHandler(event: Event) {
    const file = (event.target as HTMLInputElement)?.files?.[0]
    this.errorMessage = false
    if (!file || !file.type.match('image')) {
      this.errorMessage = true
      return
    }

    const reader = new FileReader()

    reader.onloadend = (loadEvent: ProgressEvent<FileReader>) => {
      const result = loadEvent.target?.result?.toString() ?? ''
      this.preview.set(result)
      this.moveAvatarToParent.emit(result)
    }
    reader.readAsDataURL(file)
  }

  resetAvatar() {
    this.preview.set(this.defaultAvatar)
    // Clear the file input element value
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''
    }
  }
}
