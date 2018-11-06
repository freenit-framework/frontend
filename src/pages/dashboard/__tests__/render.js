import { mount } from 'enzyme'
import services from 'mock'
import Dashboard from '..'


it('dashboard page', () => {
  mount(services.createComponent(['/'], '/', Dashboard))
  expect(services.taskService.taskList).toHaveBeenCalled()
  expect(services.workflowService.workflowList).toHaveBeenCalled()
  expect(services.workflowService.workflowList.mock.calls[0][0]).toBe(0)
})
