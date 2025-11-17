const generateColor = (classId: number): string => {
  const colors = [
    "#FF3838",
    "#FF9933",
    "#FFCC33",
    "#CCFF33",
    "#66FF33",
    "#33FF66",
    "#33FFCC",
    "#33CCFF",
    "#3366FF",
    "#6633FF",
    "#CC33FF",
    "#FF33CC",
  ];
  return colors[classId % colors.length];
};

export default generateColor;
