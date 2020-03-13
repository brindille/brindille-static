module.exports = [
  {
    type: 'input',
    name: 'name',
    message: "What's the component's name?"
  },
  {
    type: 'select',
    name: 'type',
    message: 'What type of component is this?',
    choices: ['component', 'layout', 'section']
  }
]
