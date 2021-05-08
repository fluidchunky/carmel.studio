import React, { useState, useEffect } from 'react'
import { Layout, Menu, Tree } from 'antd';
import { PictureOutlined, BlockOutlined, FolderOutlined, FileTextOutlined, FontSizeOutlined } from '@ant-design/icons'

import { Editor } from './Editor'

const { Content, Sider } = Layout
const { SubMenu } = Menu

/**
 * 
 * @param props 
 */
export const Info: React.FC<any> = (props) => {
  const { product, height, openFile, visible, onSelect } = props
  const { files } = product
  
  const [data, setData] = useState([])
  const [chunk, setChunk] = useState()
  const [chunks, setChunks] = useState([])
  const [asset, setAsset] = useState()
  const [tree, setTree] = useState([])
  const [selectedFile, setSelectedFile] = useState(`.carmel.json`)

//   const onMenuItemSelected = (value: any) => {
//     setSelectedFile(`carmel/chunks/${value.key}`)
//   }

//   const parseChunksData = (root: any, id = 'chunks') => {
//     const shadow = Object.assign({}, root)

//     const { __path, __files } = shadow
//     delete shadow.__path && delete shadow.__files

//     const chunksData = Object.keys(shadow).map((id: string) => ({
//       id,
//       files: shadow[id].__files
//     }))
//     setChunks(chunksData)
//   }

//   const renderChunksMenu = () => {
//     return chunks.map((chunk: any) => (<SubMenu
//         key="chunk"
//         title={
//           <span>
//             <BlockOutlined/>
//             <span> 
//               { chunk.id }
//             </span>
//           </span>
//         }>
//         { chunk.files.map((i: string) =>  <Menu.Item key={`${chunk.id}/${i}`} icon={<FileTextOutlined />}>{ i }</Menu.Item>)}       
//       </SubMenu>))
//  }

//   const renderMenu = () => {
//     return <Menu
//       mode="inline"
//       onSelect={onMenuItemSelected}
//       style={{ width: "100%", border: "none" }}>
//         { renderChunksMenu() }
//     </Menu>
//   }

//   useEffect(() => {
//     if (!files.chunks) return 

//     parseChunksData(files.chunks)
//   }, [files])

//   useEffect(() => {
//     if (!selectedFile) return 
//     onSelect(selectedFile)
//   }, [selectedFile])

//   useEffect(() => {
//     if (!selectedFile || !visible) return 
//     onSelect(selectedFile)
//   }, [visible])

  useEffect(() => {
    if (!selectedFile || !visible) return 
    onSelect(selectedFile)
  }, [visible])
 
  const onMenuItemSelected = async (value: any) => {
    const [type, path] = value.key.split("|")
  }        

  const renderMenu = () => {
    return <Menu
    mode="inline"
    onSelect={onMenuItemSelected}
    style={{ 
      width: "100%", 
      border: "none" 
    }}>     
   </Menu>
  } 

  const renderEditor = () => {
     if (!selectedFile) {
       return <div/>
     }

     return <Editor 
          product={product} 
          openFile={openFile}
          selectedFile={selectedFile}/>
  }

  const renderSider = () => {
    return <Sider style={{
      backgroundColor: "#ffffff",
      overflow: "auto",
      padding: 5
    }}>
      { renderMenu() }
    </Sider>
  }

  const renderContent = () => {
    return  <Content style={{ margin: 0 }}>
        { renderEditor() }
    </Content> 
  }

  return (<Layout style={{ 
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      margin: 0,
      flex: 1,
      padding: 0,
      backgroundColor: "#eeeeee",
      alignItems: 'stretch',
      alignSelf: "stretch",
      width: "100%",
      height
    }}>
        { renderContent() }
    </Layout>)
}