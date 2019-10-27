import React from 'react'
import { mount } from 'enzyme'
import { act } from 'react-dom/test-utils'
import TestApp from 'TestApp'
import service, { config } from '../mock'


it('role list', async () => {
  let wrapper
  const props = { path: '/roles' }
  config.fetchAll = true
  await act(async () => {
    wrapper = await mount(
      <TestApp path={props.path} />
    )
  })
  expect(service.fetchAll).toHaveBeenCalled()
  const page = wrapper.find('div[data-id="page"]')
  expect(page.text()).toBe("0")
  const addButton = wrapper.find('button[data-id="add"]')
  await act(async () => {
    await addButton.simulate('click')
  })
  wrapper.setProps(props)
  const name = wrapper.find('input')
  const nameEvent = {
    target: {
      value: 'newrole',
    },
  }
  name.simulate('change', nameEvent)
  const form = wrapper.find('form')
  await act(async () => {
    await form.simulate('submit')
  })
  expect(service.create).toHaveBeenCalledWith({ name: nameEvent.target.value })
})
