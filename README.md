# VectorCraft SVG Editor

VectorCraft 是一个功能强大的基于 Web 的 SVG 编辑器，专为设计师和开发者打造，提供直观的界面来创建和编辑 SVG 图形。

## 功能特性

- **代码编辑器**：直接编辑 SVG 代码，实时预览效果
- **结构树视图**：可视化查看和管理 SVG 元素的层次结构
- **实时预览**：编辑时实时查看效果
- **元素检查器**：
  - 路径检查器（Path Inspector）：编辑路径元素的属性
  - 形状检查器（Shape Inspector）：编辑矩形和圆形等基本形状
- **导出功能**：将创建的 SVG 导出为文件

## 技术栈

- React 19.2.4
- TypeScript
- Vite
- lucide-react（图标库）

## 项目结构

```
vectorcraft-svg-editor/
├── components/         # React 组件
│   ├── AppearanceControl.tsx  # 外观控制组件
│   ├── CodeEditor.tsx         # 代码编辑器组件
│   ├── PathInspector.tsx      # 路径检查器组件
│   ├── Preview.tsx            # 预览组件
│   ├── ShapeInspector.tsx     # 形状检查器组件
│   └── StructureTree.tsx      # 结构树组件
├── utils/              # 工具函数
│   ├── domUtils.ts     # DOM 操作工具
│   └── pathUtils.ts    # 路径操作工具
├── App.tsx             # 主应用组件
├── types.ts            # TypeScript 类型定义
├── README.md           # 项目说明
├── design.md           # 设计文档
├── index.html          # HTML 入口文件
└── package.json        # 项目配置和依赖
```

## 安装与运行

### 前置要求

- Node.js 16.0 或更高版本
- npm 7.0 或更高版本

### 安装步骤

1. 克隆项目到本地

```bash
git clone <项目地址>
cd vectorcraft-svg-editor
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 在浏览器中打开应用

开发服务器启动后，会在终端显示访问地址，通常是 `http://localhost:5173`

## 构建生产版本

```bash
npm run build
```

构建产物会生成在 `dist` 目录中。

## 使用指南

### 编辑模式

应用提供两种编辑模式：

1. **代码模式**：直接编辑 SVG 代码，适合熟悉 SVG 语法的用户
2. **结构模式**：通过可视化的结构树查看和选择 SVG 元素

### 选择和编辑元素

1. 在预览区域点击元素进行选择
2. 或在结构树中点击元素进行选择
3. 选择元素后，会根据元素类型显示相应的检查器
4. 在检查器中修改元素属性，实时查看效果

### 导出 SVG

点击顶部导航栏的 "Export SVG" 按钮，将当前编辑的 SVG 导出为文件。

## 示例 SVG

应用启动时会加载一个示例 SVG，包含以下元素：
- 背景矩形
- 带有渐变填充的圆形
- 波浪路径
- 虚线矩形
- 文本元素

## 开发指南

### 添加新功能

1. 在 `components/` 目录中创建新组件
2. 在 `utils/` 目录中添加必要的工具函数
3. 在 `types.ts` 中定义新的类型
4. 在 `App.tsx` 中集成新组件

### 代码风格

项目使用 TypeScript，建议遵循以下代码风格：
- 使用函数式组件和 React Hooks
- 为组件和函数添加类型注解
- 使用命名导出而非默认导出（除了主应用组件）
- 保持组件职责单一

## 许可证

MIT 许可证

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 联系方式

如果有任何问题或建议，请通过 GitHub Issues 与我们联系。

---

VectorCraft SVG Editor - 让 SVG 编辑变得简单而强大！