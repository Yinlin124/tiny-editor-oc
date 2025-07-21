<script setup lang="ts">
import FluentEditor, { Delta, generateTableUp, generateTableUpShortKeyMenu } from '@opentiny/fluent-editor'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'
import HeaderList from 'quill-header-list'
import { createSelectBox, defaultCustomSelect, TableMenuContextmenu, TableResizeLine, TableResizeScale, TableSelection, TableUp } from 'quill-table-up'
import { onMounted, ref } from 'vue'

FluentEditor.register({ 'modules/header-list': HeaderList }, true)
FluentEditor.register({ 'modules/table-up': generateTableUp(TableUp) }, true)

const { tableUpConfig, tableUpKeyboardControl } = generateTableUpShortKeyMenu(createSelectBox)
tableUpConfig.title = '_i18n"table"'

let editor: FluentEditor
const headerListRef = ref<HTMLElement>()

const title = ref('测试文档')

const TOOLBAR_CONFIG = [
  ['undo', 'redo', 'format-painter', 'clean'],
  [
    { header: [false, 1, 2, 3, 4, 5, 6] },
    { size: ['12px', '13px', '14px', '15px', '16px', '19px', '22px', '24px', '29px', '32px', '40px', '48px'] },
    'bold',
    'italic',
    'strike',
    'underline',
    { script: 'super' },
    { script: 'sub' },
    'code',
  ],
  [{ color: [] }, { background: [] }],
  [
    { align: ['', 'center', 'right', 'justify'] },
    { list: 'ordered' },
    { list: 'bullet' },
    { indent: '+1' },
    { indent: '-1' },
    { 'line-height': ['1', '1.15', '1.5', '2', '2.5', '3'] },
  ],
  [{ list: 'check' }, 'link', 'blockquote', 'divider'],
  [{ 'table-up': [] }, 'header-list'],
  // 'imgs'
  ['file', 'image', 'video'],
]

Quill.register('modules/cursors', QuillCursors)
onMounted(() => {
  editor = new FluentEditor('#editor', {
    theme: 'snow',
    modules: {
      'toolbar': {
        container: TOOLBAR_CONFIG,
        handlers: {
          'header-list': HeaderList.toolbarHandle,
        },
      },
      'header-list': {
        container: headerListRef.value,
        scrollContainer: window,
      },
      'table-up': {
        customSelect: defaultCustomSelect,
        selection: TableSelection,
        selectionOptions: {
          tableMenu: TableMenuContextmenu,
        },
        resize: TableResizeLine,
        resizeScale: TableResizeScale,
      },
      'shortcut-key': {
        menuItems: [tableUpConfig],
        isMenuItemsAdd: true,
        menuKeyboardControls(event, data) {
          let result = false
          result = tableUpKeyboardControl(event, data) || result
          return result
        },
      },
      // 图片上传
      'uploader': {
        // only allow image
        mimetypes: ['image/*'],
        handler(range: Range, files: File[]) {
          return files.map((_, i) => i % 2 === 0 ? false : 'https://yinlin-img.oss-cn-beijing.aliyuncs.com/img/20250523003800.png')
        },
        fail(file: File, range: Range) {
          this.quill.updateContents(new Delta().retain(range.index).delete(1).insert({ image: 'https://yinlin-img.oss-cn-beijing.aliyuncs.com/img/20250523003800.png' }))
        },
      },
      'cursors': true, // 一定要在 collaboration 前开启
      'collaboration': {
        providers: [
          {
            type: 'websocket',
            options: {
              serverUrl: 'ws://127.0.0.1:1234',
              roomname: 'hocuspocus-demos-quill',
            },
          },
        ],
        awareness: {
          state: {
            name: `user${Math.random().toString(36).substring(2, 15)}`,
            color: '#193549',
          },
        },
        offline: true,
      },
    },
  })
})
</script>

<template>
  <div
    class="fixed top-0 z-1 h-[52px] w-full flex items-center pl-[16px] bg-white"
  >
    <RouterLink to="/" class="hidden">
      &lt;返回
    </RouterLink>
    <span>{{ title }}</span>
  </div>
  <div class="!mt-[94px]">
    <!-- <div class="titleBox flex justify-center pt-[33px] pb-[26px]">
      <textarea v-model="title" placeholder="请输入标题" class="w-[750px] text-[#262626] h-[54px] outline-none resize-none text-[36px] font-bold placeholder-[#bfbfbf]" />
    </div> -->
    <div id="editor" class="!border-0 max-w-[750px] !ml-auto !mr-auto z-[2]" />
  </div>
  <div ref="headerListRef" class="header-list is-hidden fixed top-[140px] right-0">
    <p>大纲</p>
  </div>
</template>

<style lang="scss">
:deep(.ql-cursor-flag) {
  z-index: 9999 !important;
}

// 确保所有光标相关元素都有足够高的层级
:deep(.ql-cursor) {
  z-index: 9999 !important;
}

:deep(.ql-cursor-caret) {
  z-index: 9999 !important;
}

:deep(.ql-cursor-selection) {
  z-index: 9998 !important;
}

// 如果有光标名称标签
:deep(.ql-cursor-name) {
  z-index: 10000 !important;
}

// 确保协作光标容器也有正确的层级
:deep(.ql-cursors) {
  z-index: 9999 !important;
}
.titleBox {
  z-index: -1 !important;
}
.ql-editor {
  padding: 0 !important;
  min-height: calc(100vh - 94px);
  font-family:
    PingFang SC,
    Hiragino Sans GB,
    Microsoft YaHei,
    Helvetica Neue,
    Helvetica,
    Arial,
    sans-serif,
    Segoe UI;
  font-size: 15px !important;
  color: #262626;

  p {
    line-height: 2.2;
  }

  hr {
    margin: 12px 0;
    color: #e7e9e8;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: #262626;
    font-weight: 700;
  }

  h1 {
    font-size: 28px !important;
    line-height: 38px !important;
    margin-top: 38px !important;
    margin-bottom: 19px !important;
  }

  h2 {
    font-size: 24px !important;
    line-height: 34px !important;
    margin-top: 34px !important;
    margin-bottom: 17px !important;
  }

  h3 {
    font-size: 20px !important;
    line-height: 30px !important;
    margin-top: 30px !important;
    margin-bottom: 15px !important;
  }

  h4 {
    font-size: 16px !important;
    line-height: 26px !important;
    margin-top: 26px !important;
    margin-bottom: 13px !important;
  }

  h5,
  h6 {
    font-size: 15px !important;
    line-height: 24px !important;
    margin-top: 24px !important;
    margin-bottom: 12px !important;
  }

  blockquote {
    margin: 0 !important;
    border-left: solid 2px #d8dad9 !important;
    padding-left: 10px !important;
    opacity: 0.7;
    line-height: 24px;
  }

  a {
    color: #117cee !important;
    text-decoration: none !important;
  }

  ol {
    padding-left: 0 !important;
  }

  li {
    padding-left: 2em !important;
  }

  li.checked > .ql-ui,
  li.unchecked > .ql-ui {
    border-radius: 4px;
    transition: all 0.3s;
    margin-left: -20px !important;
    top: 3px;
  }

  li.unchecked > .ql-ui {
    border-color: #e7e9e8 !important;
  }

  li.checked > .ql-ui {
    border-color: #00b96b !important;
    background-color: #00b96b !important;
  }

  li.bullet::before,
  li.ordered::before {
    position: absolute;
  }

  li.bullet::before {
    left: 26px;
    font-size: 16px;
  }

  li.ordered::before {
    left: 28px;
    font-size: 14px;
  }

  code {
    margin: 1px 3px;
    font-size: 15px !important;
    background-color: #0000000f !important;
    border-color: #e7e9e8;
  }
}

.ql-toolbar {
  position: fixed !important;
  z-index: 1;
  width: 100%;
  top: 52px;
  padding-left: 16px !important;
  background-color: #fff !important;
  border-left: 0;
  border-right: 0;
  border-color: #0000000a !important;
  text-align: center;
}
</style>
