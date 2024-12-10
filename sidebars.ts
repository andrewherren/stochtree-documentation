import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'C++ Core',
      items: [
        {
          type: 'autogenerated',
          dirName: 'cpp-documentation-markdown',
        },
      ],
      collapsed: true,
    },
    {
      type: 'category',
      label: 'R Package',
      items: [
        {
          type: 'autogenerated',
          dirName: 'r-documentation-markdown',
        },
      ],
      collapsed: true,
    },
    {
      type: 'category',
      label: 'Python Package',
      items: [
        {
          type: 'autogenerated',
          dirName: 'python-documentation-markdown',
        },
      ],
      collapsed: true,
    },
  ],
};

export default sidebars;
