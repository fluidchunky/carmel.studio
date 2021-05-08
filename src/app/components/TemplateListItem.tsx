import React from 'react'
import { TemplateListItemComponentProps } from '../types'
import { Card, Button, Avatar, Typography } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';

const { Meta } = Card
const { Title, Text } = Typography

/**
 * 
 * @param props 
 */
export const TemplateListItem: React.FC<TemplateListItemComponentProps> = (props) => {
  const { template, onSelected } = props
  
  const { name, latestVersion } = (template as any)

  return (<div onClick={() => onSelected(template)}>
    <Card
      hoverable
      style={{ 
        width: 200, 
        height: 200, 
        margin: 20, 
        display: 'flex',
        flexDirection: "column",
        alignItems: "center",
        border: "1px solid #dddddd",
        justifyContent: "center",
        textAlign: "center"
      }}>
      <Title level={4}> { name } </Title>    
      <Text> { latestVersion } </Text>  
  </Card></div>)
}