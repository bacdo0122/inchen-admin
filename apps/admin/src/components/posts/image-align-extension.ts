import Image from '@tiptap/extension-image';

export type ImageAlign = 'left' | 'center' | 'right';

/** Ảnh chèn vào tin tức, thêm thuộc tính căn lề (data-align) — mặc định trái, giữ nguyên hành vi upload/setImage. */
export const ImageWithAlign = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
        parseHTML: (element) => (element as HTMLElement).getAttribute('data-align') || 'left',
        renderHTML: (attributes) => {
          if (!attributes.align || attributes.align === 'left') return {};
          return { 'data-align': attributes.align };
        },
      },
    };
  },
});
