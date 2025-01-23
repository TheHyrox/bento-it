export interface Position {
    x: number;
    y: number;
    w: number;
    h: number;
  }
  
  export interface Style {
    backgroundColor?: string;
    textColor?: string;
  }

  export type BlockType = 'text' | 'image' | 'video' | 'link';
  
  export interface Block {
    id: string;
    type: BlockType;
    content: string;
    position: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    isCenter?: boolean;
    style: {
      backgroundColor?: string;
      textColor?: string;
    };
  }
  
  export interface User {
    _id?: string;
    username: string;
    email: string;
    password: string;
    register_date: Date;
    blocks: Block[];
  }
  
  export type BlockType = Block['type'];