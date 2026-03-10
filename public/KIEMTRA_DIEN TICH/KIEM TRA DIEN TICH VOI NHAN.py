# -*- coding: utf-8 -*-
"""
TOPO vs NHÃN - QUY TRÌNH TỪNG BƯỚC
(Tích hợp bản đồ trực tiếp)
"""

import os, sys, math, re  # [FIX] Thêm import re để xử lý tên layer
from typing import List, Dict

from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QFont, QColor
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QFileDialog, QMessageBox,
    QVBoxLayout, QHBoxLayout, QGroupBox, QLineEdit, QPushButton,
    QSplitter, QTableWidget, QTableWidgetItem, QHeaderView,
    QTextEdit, QDialog, QListWidget, QListWidgetItem, QLabel, QStyle,
    QCheckBox, QScrollArea
)

from shapely.geometry import Point, Polygon, LineString, MultiPolygon
from shapely.ops import unary_union, polygonize
import pandas as pd
import ezdxf

# Import từ file gốc
try:
    from qgis.core import QgsApplication

    _HAS_QGIS = True
except Exception:
    _HAS_QGIS = False

# =========================================================
# MAP CANVAS WIDGET (Inline)
# =========================================================
from PyQt5.QtGui import QColor, QFont

try:
    from qgis.core import (
        QgsVectorLayer, QgsFeature, QgsGeometry, QgsField, QgsPointXY,
        QgsFillSymbol, QgsCategorizedSymbolRenderer, QgsRendererCategory,
        QgsPalLayerSettings, QgsTextFormat, QgsVectorLayerSimpleLabeling,
        QgsProject, QgsTextBufferSettings
    )
    from qgis.gui import QgsMapCanvas, QgsMapToolPan, QgsMapToolZoom
    from PyQt5.QtCore import QVariant

    _HAS_MAP_WIDGET = True
except:
    _HAS_MAP_WIDGET = False


class MapCanvasWidget(QWidget):
    """Widget chứa QGIS Map Canvas với zoom controls"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.poly_layer = None
        self.text_layer = None
        self.highlight_layer = None  # Layer để highlight thửa được chọn
        self._setup_ui()

    def _setup_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        if not _HAS_MAP_WIDGET:
            lbl = QLabel("⚠️ Không thể tạo map canvas (thiếu QGIS)")
            layout.addWidget(lbl)
            return

        # Toolbar
        toolbar = QHBoxLayout()

        self.btn_zoom_in = QPushButton("🔍+")
        self.btn_zoom_in.setMaximumWidth(50)
        self.btn_zoom_in.clicked.connect(self.zoom_in)

        self.btn_zoom_out = QPushButton("🔍-")
        self.btn_zoom_out.setMaximumWidth(50)
        self.btn_zoom_out.clicked.connect(self.zoom_out)

        self.btn_zoom_full = QPushButton("⬜ Full")
        self.btn_zoom_full.setMaximumWidth(70)
        self.btn_zoom_full.clicked.connect(self.zoom_full)

        toolbar.addWidget(self.btn_zoom_in)
        toolbar.addWidget(self.btn_zoom_out)
        toolbar.addWidget(self.btn_zoom_full)
        toolbar.addStretch()

        layout.addLayout(toolbar)

        # Map Canvas
        self.canvas = QgsMapCanvas()
        self.canvas.setCanvasColor(Qt.black)
        self.canvas.setMinimumHeight(400)

        # Pan tool
        self.pan_tool = QgsMapToolPan(self.canvas)
        self.canvas.setMapTool(self.pan_tool)

        layout.addWidget(self.canvas)

    def zoom_in(self):
        if _HAS_MAP_WIDGET:
            self.canvas.zoomIn()

    def zoom_out(self):
        if _HAS_MAP_WIDGET:
            self.canvas.zoomOut()

    def zoom_full(self):
        if _HAS_MAP_WIDGET and self.poly_layer:
            self.canvas.setExtent(self.poly_layer.extent())
            self.canvas.refresh()

    def update_map(self, polys, poly_info, rows=None, map_name=None):
        """Cập nhật bản đồ với dữ liệu mới"""
        if not _HAS_MAP_WIDGET:
            return

        # Clear old layers
        QgsProject.instance().removeAllMapLayers()

        # Create new layers
        self.poly_layer = self._create_polygon_layer(polys, poly_info)
        self.text_layer = self._create_text_layer(polys, poly_info, map_name)

        # Add to canvas
        self.canvas.setLayers([self.text_layer, self.poly_layer])

        # Zoom to extent
        self.canvas.setExtent(self.poly_layer.extent())
        self.canvas.refresh()

    def _create_polygon_layer(self, polys, poly_info):
        """Tạo polygon layer với màu theo trạng thái"""
        layer = QgsVectorLayer("Polygon?crs=EPSG:4326", "Polygons", "memory")
        provider = layer.dataProvider()

        provider.addAttributes([
            QgsField("id", QVariant.Int),
            QgsField("so_thua", QVariant.Int),
            QgsField("assigned", QVariant.String)
        ])
        layer.updateFields()

        features = []
        for idx, (poly, info) in enumerate(zip(polys, poly_info)):
            feat = QgsFeature()
            coords = list(poly.exterior.coords)
            qgs_points = [QgsPointXY(x, y) for x, y in coords]
            geom = QgsGeometry.fromPolygonXY([qgs_points])
            feat.setGeometry(geom)

            so_thua = info.get("so_thua")
            assigned = "Đã gán" if so_thua is not None else "Chưa gán"

            feat.setAttributes([idx + 1, so_thua if so_thua else 0, assigned])
            features.append(feat)

        provider.addFeatures(features)
        layer.updateExtents()

        # Styling
        categories = []
        symbol_assigned = QgsFillSymbol.createSimple({
            'color': '0,255,0,80',
            'outline_color': '0,200,0,255',
            'outline_width': '0.5'
        })
        categories.append(QgsRendererCategory("Đã gán", symbol_assigned, "Đã gán"))

        symbol_unassigned = QgsFillSymbol.createSimple({
            'color': '255,0,0,80',
            'outline_color': '200,0,0,255',
            'outline_width': '0.5'
        })
        categories.append(QgsRendererCategory("Chưa gán", symbol_unassigned, "Chưa gán"))

        layer.setRenderer(QgsCategorizedSymbolRenderer("assigned", categories))

        return layer

    def _create_text_layer(self, polys, poly_info, map_name=None):
        """Tạo text layer - hiển thị số thửa, loại đất, diện tích tại centroid"""
        layer = QgsVectorLayer("Point?crs=EPSG:4326", "Labels", "memory")
        provider = layer.dataProvider()

        provider.addAttributes([
            QgsField("label", QVariant.String)
        ])
        layer.updateFields()

        # Tạo label tại centroid của mỗi polygon
        features = []
        for idx, (poly, info) in enumerate(zip(polys, poly_info)):
            try:
                # Lấy centroid
                centroid = poly.centroid
                x, y = centroid.x, centroid.y

                # Tạo label text
                so_thua = info.get("so_thua")
                ma_loai_dat = info.get("ma_loai_dat", "")
                label_area = info.get("label_area")
                topo_area = info.get("topo_area", 0.0)

                # Format label
                label_parts = []
                if map_name:
                    label_parts.append(str(map_name))
                
                if so_thua is not None:
                    label_parts.append(f"{so_thua}")
                
                if ma_loai_dat:
                    label_parts.append(str(ma_loai_dat))

                if label_area is not None:
                     label_parts.append(f"{label_area}")
                elif topo_area > 0:
                     label_parts.append(f"({topo_area:.1f})")

                label_text = "\n".join(label_parts)

                feat = QgsFeature()
                feat.setGeometry(QgsGeometry.fromPointXY(QgsPointXY(x, y)))
                feat.setAttributes([label_text])
                features.append(feat)
            except Exception as e:
                continue

        provider.addFeatures(features)
        layer.updateExtents()

        # Labeling
        label_settings = QgsPalLayerSettings()
        label_settings.fieldName = "label"
        label_settings.enabled = True

        text_format = QgsTextFormat()
        text_format.setFont(QFont("Arial", 8, QFont.Bold))
        text_format.setSize(8)
        text_format.setColor(QColor(0, 0, 0))

        buffer = QgsTextBufferSettings()
        buffer.setEnabled(True)
        buffer.setSize(0.8)
        buffer.setColor(QColor(255, 255, 255))
        text_format.setBuffer(buffer)

        label_settings.setFormat(text_format)
        layer.setLabeling(QgsVectorLayerSimpleLabeling(label_settings))
        layer.setLabelsEnabled(True)

        return layer

    def zoom_to_index(self, index):
        """Zoom đến polygon có index tương ứng"""
        if not _HAS_MAP_WIDGET or not self.poly_layer:
            return
        
        # Index trong poly_layer bắt đầu từ 1 (do setAttributes có +1)
        try:
            # Lấy feature tại index
            features = list(self.poly_layer.getFeatures())
            if 0 <= index < len(features):
                feature = features[index]
                
                # Zoom đến feature
                bbox = feature.geometry().boundingBox()
                
                # Mở rộng bbox một chút để dễ nhìn
                bbox.scale(1.5)
                
                self.canvas.setExtent(bbox)
                self.canvas.refresh()
                
        except Exception as e:
            print(f"Error zooming to index {index}: {e}")
    
    def highlight_polygon(self, index):
        """Bôi màu vàng polygon tại index"""
        if not _HAS_MAP_WIDGET or not self.poly_layer:
            return
        
        try:
            # Xóa highlight cũ
            self.clear_highlight()
            
            # Lấy feature tại index
            features = list(self.poly_layer.getFeatures())
            if 0 <= index < len(features):
                feature = features[index]
                
                # Tạo highlight layer
                self.highlight_layer = QgsVectorLayer("Polygon?crs=EPSG:4326", "highlight", "memory")
                provider = self.highlight_layer.dataProvider()
                
                # Thêm feature vào highlight layer
                highlight_feature = QgsFeature()
                highlight_feature.setGeometry(feature.geometry())
                provider.addFeatures([highlight_feature])
                
                # Tạo symbol màu vàng trong suốt
                symbol = QgsFillSymbol.createSimple({
                    'color': '255,255,0,100',  # Vàng, alpha=100
                    'outline_color': 'yellow',
                    'outline_width': '2',
                    'outline_style': 'solid'
                })
                self.highlight_layer.renderer().setSymbol(symbol)
                
                # Thêm vào canvas (ở trên cùng)
                QgsProject.instance().addMapLayer(self.highlight_layer, False)
                layers = self.canvas.layers()
                self.canvas.setLayers([self.highlight_layer] + layers)
                
                self.canvas.refresh()
                
        except Exception as e:
            print(f"Error highlighting index {index}: {e}")
    
    def clear_highlight(self):
        """Xóa highlight"""
        if self.highlight_layer:
            QgsProject.instance().removeMapLayer(self.highlight_layer)
            self.highlight_layer = None
            self.canvas.refresh()


# =========================================================
# CORE DXF FUNCTIONS (Inline - Standalone)
# =========================================================

def flatten_dxf_to_text_line(dxf_path: str, *args, **kwargs) -> str:
    """Flatten DXF file to text format"""
    try:
        doc = ezdxf.readfile(dxf_path)
        msp = doc.modelspace()
        lines = []
        lines.append(f"DXF File: {dxf_path}")
        lines.append(f"Entities: {len(list(msp))}")
        return "\n".join(lines)
    except Exception as e:
        return f"Error: {e}"


def read_all_entities(dxf_path: str):
    """Đọc tất cả entities từ DXF file - [FIX] Hỗ trợ layer chữ và MTEXT"""
    try:
        doc = ezdxf.readfile(dxf_path)
        msp = doc.modelspace()

        rows = []
        for entity in msp:
            # --- XỬ LÝ TÊN LAYER (FIX LỖI 'Level 55' & Layer chữ) ---
            raw_layer = entity.dxf.get("layer", "0")
            level = raw_layer  # Mặc định lấy nguyên gốc
            
            # Thử chuyển về số nguyên nếu có thể
            try:
                # Nếu toàn là số (vd: "13")
                level = int(raw_layer)
            except ValueError:
                # Nếu là chuỗi (vd: "Level 13", "Ranh giới")
                # Ưu tiên lấy số nếu có (để tương thích Logic cũ User quen dùng)
                # NHƯNG nếu không có số thì GIỮ NGUYÊN chuỗi
                nums = re.findall(r'\d+', str(raw_layer))
                if nums:
                    try:
                        level = int(nums[0])
                    except:
                        level = str(raw_layer)
                else:
                    level = str(raw_layer) # Layer chữ (vd: "Texts", "Ranh_gioi")
            
            row = {
                "ent": entity,
                "dxftype": entity.dxftype(),
                "level": level,
                "type": entity.dxftype()
            }

            # Extract coordinates based on type
            # [FIX]: Thêm MTEXT vào đây
            if entity.dxftype() in ["TEXT", "MTEXT"]:
                text_val = ""
                if entity.dxftype() == "TEXT":
                    text_val = entity.dxf.text
                elif entity.dxftype() == "MTEXT":
                    try:
                        text_val = entity.text if hasattr(entity, "text") else entity.dxf.text
                    except:
                        text_val = ""

                row["text"] = text_val
                row["x"] = entity.dxf.insert[0]
                row["y"] = entity.dxf.insert[1]

            elif entity.dxftype() == "LINE":
                row["x1"] = entity.dxf.start[0]
                row["y1"] = entity.dxf.start[1]
                row["x2"] = entity.dxf.end[0]
                row["y2"] = entity.dxf.end[1]
            elif entity.dxftype() == "LWPOLYLINE":
                try:
                    points = list(entity.get_points("xy"))
                    row["points"] = points
                except:
                    pass

            rows.append(row)

        return rows
    except Exception as e:
        print(f"Error reading DXF: {e}")
        return []

def read_all_entities_recursive(dxf_path: str):
    """Đọc tất cả entities từ DXF file - [FIX] Hỗ trợ Block/Insert và Layer chữ (Recursive)"""
    try:
        doc = ezdxf.readfile(dxf_path)
        msp = doc.modelspace()
        rows = []

        def _process_single_entity(entity, offset_x=0.0, offset_y=0.0):
            # --- XỬ LÝ TÊN LAYER ---
            raw_layer = entity.dxf.get("layer", "0")
            level = raw_layer
            try:
                # Ưu tiên số nếu là chuỗi số
                level = int(raw_layer)
            except ValueError:
                nums = re.findall(r'\d+', str(raw_layer))
                if nums:
                    try:
                        level = int(nums[0])
                    except:
                        level = str(raw_layer)
                else:
                    level = str(raw_layer)
            
            # [FIX] Force keep valid string layers if they are meaningful
            # Nếu tên layer không phải là số (vd: "Ranh giới", "Thửa đất"), giữ nguyên string
            # Logic ở trên đã handle được, nhưng đảm bảo:
            if isinstance(raw_layer, str) and not raw_layer.isdigit():
                 # Nếu có số trong chuỗi, ta đã extract ở trên.
                 # Nếu user muốn giữ cả tên gốc?
                 pass 


            row = {
                "ent": entity,
                "dxftype": entity.dxftype(),
                "level": level,
                "type": entity.dxftype()
            }

            # Coordinates with offset
            # [FIX] Thêm MTEXT vào đây
            if entity.dxftype() in ["TEXT", "MTEXT"]:
                text_val = ""
                if entity.dxftype() == "TEXT":
                    text_val = entity.dxf.text
                elif entity.dxftype() == "MTEXT":
                    try:
                        text_val = entity.text if hasattr(entity, "text") else entity.dxf.text
                    except:
                        text_val = ""
                
                row["text"] = text_val
                row["x"] = entity.dxf.insert[0] + offset_x
                row["y"] = entity.dxf.insert[1] + offset_y

            elif entity.dxftype() == "LINE":
                row["x1"] = entity.dxf.start[0] + offset_x
                row["y1"] = entity.dxf.start[1] + offset_y
                row["x2"] = entity.dxf.end[0] + offset_x
                row["y2"] = entity.dxf.end[1] + offset_y

            elif entity.dxftype() == "LWPOLYLINE":
                try:
                    points = list(entity.get_points("xy"))
                    # Apply offset to all points
                    row["points"] = [(x + offset_x, y + offset_y) for x, y in points]
                except:
                    pass
            
            return row

        # Recursive function to handle nested blocks
        def _scan_entities(entities, offset_x=0.0, offset_y=0.0, depth=0):
            if depth > 5: return # Avoid infinite recursion
            
            for entity in entities:
                if entity.dxftype() == 'INSERT':
                    # Handle Block Reference
                    try:
                        block_name = entity.dxf.name
                        if block_name in doc.blocks:
                            # Insert point (translation)
                            ins = entity.dxf.insert
                            ox = offset_x + ins[0]
                            oy = offset_y + ins[1]
                            
                            # Recursively scan block content
                            _scan_entities(doc.blocks[block_name], ox, oy, depth + 1)
                    except:
                        pass
                else:
                    # Normal entity
                    r = _process_single_entity(entity, offset_x, offset_y)
                    # Chỉ lấy entity có tọa độ hợp lệ
                    if r.get("x") is not None or r.get("x1") is not None or r.get("points"):
                        rows.append(r)

        # Start scanning ModelSpace
        _scan_entities(msp)

        return rows
    except Exception as e:
        print(f"Error reading DXF: {e}")
        return []


def collect_text_by_level(rows, level):
    """Thu thập tất cả text theo level"""
    result = []
    for row in rows:
        if row.get("type") in ["TEXT", "MTEXT"] and row.get("level") == level:
            result.append(row)
    return result


def build_topo_polygons_from_rows(rows, levels, snap_grid=0.001, min_area=0.01):
    """Tạo polygon từ boundary lines"""
    lines = []

    # Collect all lines from specified levels
    for row in rows:
        if row.get("level") not in levels:
            continue

        if row.get("type") == "LINE":
            x1, y1 = row.get("x1"), row.get("y1")
            x2, y2 = row.get("x2"), row.get("y2")
            if x1 is not None and y1 is not None and x2 is not None and y2 is not None:
                lines.append(LineString([(x1, y1), (x2, y2)]))

        elif row.get("type") == "LWPOLYLINE":
            points = row.get("points", [])
            if len(points) >= 2:
                lines.append(LineString(points))

    if not lines:
        return []

    # Create polygons from lines
    try:
        merged = unary_union(lines)
        polys = list(polygonize(merged))
        return polys
    except Exception as e:
        print(f"Error creating polygons: {e}")
        return []


def build_level13_points(rows):
    """Thu thập text L13 (số thửa)"""
    result = []
    for row in collect_text_by_level(rows, 13):
        x, y = row.get("x"), row.get("y")
        text = str(row.get("text", "")).strip()
        if x is not None and y is not None:
            try:
                text_clean = re.sub(r'\D', '', text)
                if text_clean:
                    so_thua = int(text_clean)
                    result.append((x, y, so_thua, row))
            except:
                pass
    return result


def build_level4_points(rows):
    """Thu thập text L4 (diện tích)"""
    result = []
    for row in collect_text_by_level(rows, 4):
        x, y = row.get("x"), row.get("y")
        text = str(row.get("text", "")).strip()
        if x is not None and y is not None:
            try:
                t = text.replace(",", ".").replace(" ", "")
                area = float(t)
                result.append((x, y, area, row))
            except:
                pass
    return result


def assign_level4_inside(polys, rows, poly_info, clusters=None, tol_near=3.0):
    """
    Bước 5: Gán bổ sung thông tin từ bảng thửa nhỏ
    
    Logic:
    1. Trích xuất bảng thông tin thửa nhỏ từ DXF (text có format "BCS 3/101.9")
    2. Lấy danh sách so_thua đã gán ở Bước 3/4
    3. Nếu so_thua có trong bảng → GHI ĐÈ ma_loai_dat và label_area (ưu tiên bảng thửa nhỏ)
    4. Gán vào poly_info
    
    Tham số:
    - polys: Danh sách polygon
    - rows: Dữ liệu DXF entities
    - poly_info: Thông tin thửa
    - clusters: Không dùng (legacy)
    - tol_near: Không dùng (legacy)
    """
    # Bước 1: Trích xuất bảng thông tin thửa nhỏ từ DXF
    small_parcel_table = extract_small_parcel_notes(rows, strict_level=False)
    
    if not small_parcel_table:
        return 0  # Không có thông tin thửa nhỏ
    
    # Bước 2: Duyệt từng polygon và gán bổ sung
    count_filled = 0
    
    for pidx, poly in enumerate(polys):
        so_thua = poly_info[pidx].get("so_thua")
        
        # Bỏ qua nếu chưa có số thửa
        if so_thua is None:
            continue
        
        # Tìm trong bảng thửa nhỏ
        if int(so_thua) in small_parcel_table:
            dien_tich, ma_loai_dat = small_parcel_table[int(so_thua)]
            
            # [FIX] GHI ĐÈ ma_loai_dat (ưu tiên bảng thửa nhỏ)
            if ma_loai_dat:
                poly_info[pidx]["ma_loai_dat"] = ma_loai_dat
            
            # [FIX] GHI ĐÈ label_area (ưu tiên bảng thửa nhỏ)
            if dien_tich:
                poly_info[pidx]["label_area"] = dien_tich
                poly_info[pidx]["label_src"] = "SmallParcel-Table"
                count_filled += 1
    
    return count_filled


def extract_small_parcel_notes(rows, strict_level=False):
    """
    Trích xuất thông tin thửa nhỏ từ text có format đặc biệt
    
    Format hỗ trợ:
    - "BCS 3/101.9" → Thửa 3: DT=101.9, Mã=BCS
    - "ONT+HNK 37/396.9" → Thửa 37: DT=396.9, Mã=ONT+HNK
    - "3/101.9" → Thửa 3: DT=101.9, Mã=None
    
    Args:
        rows: Danh sách entities từ DXF
        strict_level: Nếu True, chỉ lấy text từ level cụ thể
    
    Returns:
        dict: {so_thua: (dien_tich, ma_loai_dat)}
    """
    result = {}
    
    for row in rows:
        if row.get("type") != "TEXT":
            continue
        
        text = row.get("text", "").strip()
        if not text or "/" not in text:
            continue
        
        # Parse text có dấu /
        parsed = parse_slash_separated_text(text)
        if not parsed:
            continue
        
        so_thua = parsed.get('l13')
        ma_loai = parsed.get('l2')
        dien_tich = parsed.get('l4')
        
        if so_thua and dien_tich:
            # Lưu vào bảng (ghi đè nếu trùng)
            result[so_thua] = (dien_tich, ma_loai)
    
    return result



def find_best_polygon_for_point(polys, x, y, tol=1.0):
    """Tìm polygon chứa điểm hoặc gần nhất"""
    point = Point(x, y)
    for idx, poly in enumerate(polys):
        if poly.contains(point):
            return idx

    # Find nearest
    min_dist = float('inf')
    best_idx = None
    for idx, poly in enumerate(polys):
        dist = poly.distance(point)
        if dist < min_dist:
            min_dist = dist
            best_idx = idx

    if best_idx is not None and min_dist <= tol:
        return best_idx
    return None


def parse_slash_separated_text(text):
    """
    Parse text có dấu / để tách L2, L13, L4
    
    Các format hỗ trợ:
    - "BCS 3/101.9" → (L2=BCS, L13=3, L4=101.9)
    - "3/101.9" → (L2=None, L13=3, L4=101.9)
    - "BCS/3/101.9" → (L2=BCS, L13=3, L4=101.9)
    
    Returns:
        dict: {'l2': str|None, 'l13': int|None, 'l4': float|None}
        hoặc None nếu không parse được
    """
    if "/" not in text:
        return None
    
    # Tách theo dấu /
    parts = text.split("/")
    if len(parts) < 2:
        return None
    
    result = {'l2': None, 'l13': None, 'l4': None}
    
    # Xử lý các format khác nhau
    if len(parts) == 2:
        # Format: "BCS 3/101.9" hoặc "3/101.9"
        left_part = parts[0].strip()
        right_part = parts[1].strip()
        
        # Tách left_part thành words
        words = left_part.split()
        
        if len(words) == 2:
            # Format: "BCS 3/101.9"
            result['l2'] = words[0]  # BCS
            try:
                result['l13'] = int(re.sub(r'\D', '', words[1]))  # 3
            except:
                pass
        elif len(words) == 1:
            # Format: "3/101.9"
            try:
                result['l13'] = int(re.sub(r'\D', '', words[0]))  # 3
            except:
                pass
        
        # Parse right_part (diện tích)
        try:
            area_str = right_part.replace(",", ".").replace(" ", "")
            result['l4'] = float(area_str)
        except:
            pass
    
    elif len(parts) == 3:
        # Format: "BCS/3/101.9"
        result['l2'] = parts[0].strip()
        try:
            result['l13'] = int(re.sub(r'\D', '', parts[1].strip()))
        except:
            pass
        try:
            area_str = parts[2].strip().replace(",", ".").replace(" ", "")
            result['l4'] = float(area_str)
        except:
            pass
    
    # Chỉ return nếu có ít nhất L13
    if result['l13'] is not None:
        return result
    
    return None



def build_label_clusters(rows, cluster_radius=5.0):
    """
    Tạo cluster từ text L13, L2, L4 - Bán kính 5m
    
    QUAN TRỌNG: 
    - Ưu tiên phát hiện text nằm ngang (có dấu "/") để tránh nhóm sai
    - Mỗi L2/L4 text chỉ thuộc về 1 cluster duy nhất - cluster có L13 GẦN NHẤT
    """
    clusters = []
    used_l13_indices = set()
    used_l2_indices = set()
    used_l4_indices = set()
    
    # Collect all text points
    l13_points = build_level13_points(rows)
    l2_rows = collect_text_by_level(rows, 2)
    l4_points = build_level4_points(rows)
    
    # ===== BƯỚC 1: PHÁT HIỆN TEXT NẰM NGANG (CÓ DẤU "/") =====
    # Thu thập tất cả text có dấu "/"
    all_text_rows = []
    for row in rows:
        if row.get("type") in ["TEXT", "MTEXT"]:
            text = str(row.get("text", "")).strip()
            if "/" in text:
                all_text_rows.append(row)
    
    # Parse và tạo cluster từ text nằm ngang
    for row in all_text_rows:
        text = str(row.get("text", "")).strip()
        parsed = parse_slash_separated_text(text)
        
        if parsed and parsed.get('l13') is not None:
            x, y = row.get("x"), row.get("y")
            if x is not None and y is not None:
                cluster = {
                    "so_thua": parsed['l13'],
                    "center_x": x,
                    "center_y": y,
                    "cx": x,
                    "cy": y,
                    "type": "horizontal"  # Đánh dấu là cluster nằm ngang
                }
                
                # Thêm L2 nếu có
                if parsed.get('l2'):
                    cluster["ma_loai_dat"] = parsed['l2']
                
                # Thêm L4 nếu có
                if parsed.get('l4') is not None:
                    cluster["dien_tich"] = parsed['l4']
                    cluster["area"] = parsed['l4']
                
                clusters.append(cluster)
                
                # Đánh dấu L13 đã dùng (tìm L13 point gần nhất với vị trí này)
                for idx, (x13, y13, so_thua, _) in enumerate(l13_points):
                    if so_thua == parsed['l13']:
                        dist = math.sqrt((x - x13) ** 2 + (y - y13) ** 2)
                        if dist < 2.0:  # Trong bán kính 2m
                            used_l13_indices.add(idx)
                            break

    # ===== BƯỚC 2: XỬ LÝ CÁC TEXT RIÊNG LẺ (KHÔNG CÓ "/") =====
    # Tạo cluster từ L13 chưa được dùng
    for idx, (x13, y13, so_thua, _) in enumerate(l13_points):
        if idx not in used_l13_indices:
            clusters.append({
                "so_thua": so_thua,
                "center_x": x13,
                "center_y": y13,
                "cx": x13,
                "cy": y13,
                "type": "vertical"  # Đánh dấu là cluster nhóm dọc
            })
            used_l13_indices.add(idx)

    # GÁN L2: Mỗi L2 text → cluster có L13 gần nhất (chỉ gán cho cluster chưa có L2)
    for row in l2_rows:
        x2, y2 = row.get("x"), row.get("y")
        if x2 is None or y2 is None:
            continue
        
        # Tìm L13 gần nhất trong bán kính 5m
        best_cluster_idx = None
        best_dist = float('inf')
        
        for idx, cluster in enumerate(clusters):
            # Bỏ qua cluster đã có L2 (từ horizontal text)
            if cluster.get("ma_loai_dat"):
                continue
                
            x13, y13 = cluster["cx"], cluster["cy"]
            dist = math.sqrt((x2 - x13) ** 2 + (y2 - y13) ** 2)
            if dist <= 5.0 and dist < best_dist:
                best_dist = dist
                best_cluster_idx = idx
        
        # Gán L2 cho cluster gần nhất
        if best_cluster_idx is not None:
            clusters[best_cluster_idx]["ma_loai_dat"] = row.get("text", "")

    # GÁN L4: Mỗi L4 text → cluster có L13 gần nhất (chỉ gán cho cluster chưa có L4)
    for x4, y4, area, _ in l4_points:
        # Tìm L13 gần nhất trong bán kính 5m
        best_cluster_idx = None
        best_dist = float('inf')
        
        for idx, cluster in enumerate(clusters):
            # Bỏ qua cluster đã có L4 (từ horizontal text hoặc đã gán)
            if cluster.get("dien_tich") is not None:
                continue
                
            x13, y13 = cluster["cx"], cluster["cy"]
            dist = math.sqrt((x4 - x13) ** 2 + (y4 - y13) ** 2)
            if dist <= 5.0 and dist < best_dist:
                best_dist = dist
                best_cluster_idx = idx
        
        # Gán L4 cho cluster gần nhất
        if best_cluster_idx is not None:
            clusters[best_cluster_idx]["dien_tich"] = area
            clusters[best_cluster_idx]["area"] = area

    return clusters


def find_text_clusters_in_polygon(poly, rows, search_radius=10.0):
    """
    Tìm tất cả text clusters TRONG hoặc GẦN polygon
    
    Args:
        poly: Shapely Polygon
        rows: List of DXF entities
        search_radius: Bán kính tìm kiếm (m) - mặc định 10m
    
    Returns:
        List of clusters với format:
        [
            {
                'l13': (x, y, so_thua) hoặc None,
                'l2': (x, y, ma_loai_dat) hoặc None,
                'l4': (x, y, dien_tich) hoặc None,
                'center': (cx, cy),
                'completeness': 'full' | 'partial' | 'minimal'
            }
        ]
    """
    from shapely.geometry import Point
    import math
    
    # Thu thập text points
    l13_points = []
    l2_points = []
    l4_points = []
    
    # Tìm text L13 (số thửa)
    for row in collect_text_by_level(rows, 13):
        x, y = row.get("x"), row.get("y")
        text = str(row.get("text", "")).strip()
        if x is not None and y is not None:
            pt = Point(x, y)
            dist = poly.distance(pt)
            if poly.contains(pt) or dist <= search_radius:
                try:
                    text_clean = re.sub(r'\D', '', text)
                    if text_clean:
                        so_thua = int(text_clean)
                        l13_points.append((x, y, so_thua, dist))
                except:
                    pass
    
    # Tìm text L2 (loại đất)
    for row in collect_text_by_level(rows, 2):
        x, y = row.get("x"), row.get("y")
        text = str(row.get("text", "")).strip()
        if x is not None and y is not None:
            pt = Point(x, y)
            dist = poly.distance(pt)
            if poly.contains(pt) or dist <= search_radius:
                l2_points.append((x, y, text, dist))
    
    # Tìm text L4 (diện tích)
    for row in collect_text_by_level(rows, 4):
        x, y = row.get("x"), row.get("y")
        text = str(row.get("text", "")).strip()
        if x is not None and y is not None:
            pt = Point(x, y)
            dist = poly.distance(pt)
            if poly.contains(pt) or dist <= search_radius:
                try:
                    t = text.replace(",", ".").replace(" ", "")
                    area = float(t)
                    l4_points.append((x, y, area, dist))
                except:
                    pass
    
    # Nếu không có L13 nào, return empty
    if not l13_points:
        return []
    
    # Tạo clusters từ L13 points
    clusters = []
    used_l2 = set()
    used_l4 = set()
    
    for x13, y13, so_thua, dist13 in l13_points:
        cluster = {
            'l13': (x13, y13, so_thua),
            'l2': None,
            'l4': None,
            'center': (x13, y13),
            'completeness': 'minimal'
        }
        
        # Tìm L2 gần nhất (trong 5m)
        best_l2_idx = None
        best_l2_dist = float('inf')
        for idx, (x2, y2, text2, _) in enumerate(l2_points):
            if idx in used_l2:
                continue
            dist = math.sqrt((x13 - x2) ** 2 + (y13 - y2) ** 2)
            if dist <= 5.0 and dist < best_l2_dist:
                best_l2_dist = dist
                best_l2_idx = idx
        
        if best_l2_idx is not None:
            x2, y2, text2, _ = l2_points[best_l2_idx]
            cluster['l2'] = (x2, y2, text2)
            used_l2.add(best_l2_idx)
        
        # Tìm L4 gần nhất (trong 5m)
        best_l4_idx = None
        best_l4_dist = float('inf')
        for idx, (x4, y4, area4, _) in enumerate(l4_points):
            if idx in used_l4:
                continue
            dist = math.sqrt((x13 - x4) ** 2 + (y13 - y4) ** 2)
            if dist <= 5.0 and dist < best_l4_dist:
                best_l4_dist = dist
                best_l4_idx = idx
        
        if best_l4_idx is not None:
            x4, y4, area4, _ = l4_points[best_l4_idx]
            cluster['l4'] = (x4, y4, area4)
            used_l4.add(best_l4_idx)
        
        # Xác định completeness
        if cluster['l13'] and cluster['l2'] and cluster['l4']:
            cluster['completeness'] = 'full'
        elif cluster['l13'] and cluster['l4']:
            cluster['completeness'] = 'partial'
        else:
            cluster['completeness'] = 'minimal'
        
        clusters.append(cluster)
    
    return clusters


def detect_small_parcels_from_clusters(polys, poly_info, clusters, min_distance):
    """Phát hiện thửa nhỏ từ clusters ở xa"""
    result = {}

    for cidx, cluster in enumerate(clusters):
        cx = cluster.get("center_x") or cluster.get("cx")
        cy = cluster.get("center_y") or cluster.get("cy")

        if cx is None or cy is None:
            continue

        cluster_pt = Point(cx, cy)

        # Find nearest polygon
        min_dist = float('inf')
        nearest_pidx = None

        for pidx, poly in enumerate(polys):
            dist = poly.distance(cluster_pt)
            if dist >= min_distance and dist < min_dist:
                min_dist = dist
                nearest_pidx = pidx

        if nearest_pidx is not None:
            result[nearest_pidx] = {
                "so_thua": cluster.get("so_thua"),
                "ma_loai_dat": cluster.get("ma_loai_dat", ""),
                "dien_tich": cluster.get("dien_tich"),
                "distance": min_dist
            }

    return result


def build_check_rows(polys, poly_info):
    """Tạo bảng kiểm tra"""
    check_rows = []
    for idx, (poly, info) in enumerate(zip(polys, poly_info)):
        topo_area = info.get("topo_area", 0.0)
        label_area = info.get("label_area")
        so_thua = info.get("so_thua")

        diff = None
        diff_pct = None
        result = "Chưa gán"

        if label_area is not None and topo_area > 0:
            diff = topo_area - label_area
            diff_pct = abs(diff) / topo_area * 100
            result = "Đúng" if abs(diff) <= 0.5 else "Lệch"

        check_rows.append({
            "STT": idx + 1,
            "Số thửa": so_thua,
            "Mã loại đất": info.get("ma_loai_dat", ""),
            "DT nhãn (m²)": round(label_area, 1) if label_area else None,
            "DT topo (m²)": round(topo_area, 1),
            "Chênh lệch (m²)": round(diff, 1) if diff is not None else None,
            "Chênh lệch (%)": round(diff_pct, 2) if diff_pct is not None else None,
            "Kết quả": result,
            "Ghi chú": info.get("note", "")
        })

    return check_rows


def filter_error_rows(check_rows):
    """Lọc các dòng lỗi"""
    return [row for row in check_rows if row["Kết quả"] == "Lệch"]


# =========================================================
# MULTI-FILE UTILITIES (Inline)
# =========================================================

def extract_so_to_from_filename(filepath: str) -> str:
    """Trích xuất số tờ từ tên file"""
    filename = os.path.basename(filepath)
    name_without_ext = os.path.splitext(filename)[0]
    matches = re.findall(r'\d+', name_without_ext)
    if matches:
        num_str = matches[0]
        try:
            num = int(num_str)
            return f"{num:02d}" if num < 100 else f"{num:03d}"
        except:
            pass
    return "00"


def format_so_to_display(so_to: str) -> str:
    """Format số tờ để hiển thị"""
    return f"Tờ {so_to}"


def create_file_data_structure(dxf_path: str) -> dict:
    """Tạo cấu trúc dữ liệu cho 1 file"""
    so_to = extract_so_to_from_filename(dxf_path)
    return {
        "dxf_path": dxf_path,
        "so_to": so_to,
        "rows": None,
        "polys": None,
        "poly_info": None,
        "clusters": None,
        "selected_levels": None,
        "status": "pending"
    }


def collect_all_levels(rows: List[Dict]) -> Dict[int, int]:
    """Thu thập tất cả level từ rows - [FIX] Try-catch an toàn"""
    level_counts = {}
    for row in rows:
        level = row.get("level")
        if level is not None:
            # Không ép kiểu int nữa, để nguyên (int hoặc str)
            try:
                level_counts[level] = level_counts.get(level, 0) + 1
            except:
                pass
    return level_counts


# =========================================================
# LEVEL CONFIG DIALOGS (Inline)
# =========================================================
from PyQt5.QtWidgets import QScrollArea, QCheckBox, QComboBox, QFormLayout

class LabelConfigDialog(QDialog):
    """Dialog cấu hình level nhãn (L13, L4, L2) dùng ComboBox"""
    def __init__(self, all_levels: list, current_config: dict, parent=None, levels_with_data=None):
        super().__init__(parent)
        self.all_levels = sorted(all_levels)
        self.levels_with_data = levels_with_data if levels_with_data else set()
        self.config = current_config
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("Cấu hình nhãn của thửa đất có GCN")
        self.resize(400, 200)
        layout = QVBoxLayout(self)

        form = QFormLayout()
        
        self.cb_sothua = QComboBox()
        self.cb_dientich = QComboBox()
        self.cb_loaidat = QComboBox()
        
        # Populate - Đánh dấu ● cho level có dữ liệu
        for lv in self.all_levels:
            if lv in self.levels_with_data:
                item_text = f"● Level {lv}"  # Có dữ liệu
            else:
                item_text = f"   Level {lv}"  # Không có dữ liệu
            self.cb_sothua.addItem(item_text, lv)
            self.cb_dientich.addItem(item_text, lv)
            self.cb_loaidat.addItem(item_text, lv)

        # Set current selection
        def set_combo(cb, val):
            idx = cb.findData(val)
            if idx >= 0: cb.setCurrentIndex(idx)
        
        set_combo(self.cb_sothua, self.config.get("so_thua", 13))
        set_combo(self.cb_dientich, self.config.get("dien_tich", 4)) # Default 29 per user request? Keeping robust default
        set_combo(self.cb_loaidat, self.config.get("ma_loai_dat", 2)) 

        form.addRow("Level số thửa:", self.cb_sothua)
        form.addRow("Level diện tích:", self.cb_dientich)
        form.addRow("Level loại đất:", self.cb_loaidat)
        
        layout.addLayout(form)

        # Buttons
        btn_layout = QHBoxLayout()
        btn_ok = QPushButton("OK")
        btn_ok.clicked.connect(self.accept)
        btn_cancel = QPushButton("Cancel")
        btn_cancel.clicked.connect(self.reject)
        btn_layout.addWidget(btn_ok)
        btn_layout.addWidget(btn_cancel)
        layout.addLayout(btn_layout)

    def get_config(self):
        return {
            "so_thua": self.cb_sothua.currentData(),
            "dien_tich": self.cb_dientich.currentData(),
            "ma_loai_dat": self.cb_loaidat.currentData()
        }

class LevelSelectorDialog(QDialog):
    """Dialog cho phép chọn level Topo (Giữ nguyên logic cũ cho Topo)"""
    def __init__(self, all_levels: Dict[int, int], parent=None, all_layers=None, current_selection=None):
        super().__init__(parent)
        self.all_levels = all_levels  # Levels có dữ liệu
        self.all_layers = all_layers if all_layers else set(all_levels.keys())  # TẤT CẢ layers
        self.selected_boundary_levels = set(current_selection) if current_selection else set()
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("Chọn Level Topo")
        self.setMinimumWidth(350)
        self.setMinimumHeight(400)

        layout = QVBoxLayout()
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll_widget = QWidget()
        scroll_layout = QVBoxLayout(scroll_widget)

        # BOUNDARY LEVELS ONLY
        boundary_group = QGroupBox("Chọn layer ranh giới thửa (Topo)")
        boundary_layout = QVBoxLayout()
        
        # Hiển thị TẤT CẢ numeric levels (0-63)
        # BỎ text layers (Layer 'Defpoints', 'Level 1'...)
        numeric_layers = sorted([lv for lv in self.all_layers if isinstance(lv, int)])
        
        # Hiển thị numeric levels
        for level in numeric_layers:
            count = self.all_levels.get(level, 0)
            
            # Format: "Level X                    ●" (dấu chấm ở bên phải nếu có dữ liệu)
            base_text = f"Level {level}"
            
            # Tạo layout ngang cho mỗi level
            item_widget = QWidget()
            item_layout = QHBoxLayout(item_widget)
            item_layout.setContentsMargins(0, 0, 0, 0)
            
            cb = QCheckBox(base_text)
            
            # Pre-check nếu level đã được chọn trước đó
            if level in self.selected_boundary_levels:
                cb.setChecked(True)
            
            cb.stateChanged.connect(lambda state, lv=level: self._on_boundary_changed(lv, state))
            
            item_layout.addWidget(cb)
            item_layout.addStretch()  # Đẩy dấu chấm sang phải
            
            # Thêm dấu chấm nếu level có dữ liệu
            if count > 0:
                dot_label = QLabel("●")
                dot_label.setStyleSheet("color: black; font-size: 16px;")
                item_layout.addWidget(dot_label)
            
            boundary_layout.addWidget(item_widget)

        boundary_group.setLayout(boundary_layout)
        scroll_layout.addWidget(boundary_group)
        
        scroll.setWidget(scroll_widget)
        layout.addWidget(scroll)

        # BUTTONS
        button_layout = QHBoxLayout()
        ok_btn = QPushButton("OK")
        ok_btn.clicked.connect(self.accept)
        button_layout.addWidget(ok_btn)
        layout.addLayout(button_layout)
        self.setLayout(layout)

    def _on_boundary_changed(self, level, state):
        if state == Qt.Checked:
            self.selected_boundary_levels.add(level)
        else:
            self.selected_boundary_levels.discard(level)

    def get_selected_levels(self) -> Dict:
        return {
            "boundary": sorted(list(self.selected_boundary_levels))
        }


# =========================================================
# CLUSTER ASSIGNMENT (Inline)
# =========================================================
def dist2(ax, ay, bx, by):
    dx = ax - bx
    dy = ay - by
    return dx * dx + dy * dy


def assign_by_arrows_and_near_clusters(polys, rows, poly_info, clusters=None):
    """
    Gán thông tin cho các thửa đất bằng cách tìm text gần nhất CHƯA ĐƯỢC DÙNG.
    Dành cho các thửa có mũi tên trỏ ra ngoài.
    """

    # Bước 1: Lọc các polygon cần gán
    target_indices = []
    for pidx, info in enumerate(poly_info):
        if info.get("so_thua") is None:
            target_indices.append(pidx)

    if not target_indices:
        print(f"[DEBUG] Không có polygon nào cần gán")
        return

    # Bước 2: Thu thập tất cả text L13 và L4
    txt13_all = build_level13_points(rows)  # [(x, y, so_thua, text_obj), ...]
    txt4_all = build_level4_points(rows)  # [(x, y, area, text_obj), ...]

    # Bước 3: Xác định text nào đã được dùng ở bước 3
    used_l13_positions = set()
    used_l4_positions = set()

    for pidx, info in enumerate(poly_info):
        if info.get("so_thua") is not None:
            poly = polys[pidx]
            for i, (x, y, so_thua, _) in enumerate(txt13_all):
                try:
                    pt = Point(x, y)
                    if poly.contains(pt) or poly.distance(pt) < 10.0:
                        if int(so_thua) == info.get("so_thua"):
                            used_l13_positions.add(i)
                except:
                    pass

        if info.get("label_area") is not None:
            poly = polys[pidx]
            for i, (x, y, area, _) in enumerate(txt4_all):
                try:
                    pt = Point(x, y)
                    if poly.contains(pt) or poly.distance(pt) < 10.0:
                        if abs(float(area) - info.get("label_area", 0)) < 0.5:
                            used_l4_positions.add(i)
                except:
                    pass

    # Lọc text chưa dùng
    txt13_unused = [(i, x, y, so_thua) for i, (x, y, so_thua, _) in enumerate(txt13_all) if i not in used_l13_positions]
    txt4_unused = [(i, x, y, area) for i, (x, y, area, _) in enumerate(txt4_all) if i not in used_l4_positions]

    if not txt13_unused and not txt4_unused:
        return

    # Bước 4: Gán cho mỗi polygon
    assigned_count = 0
    for pidx in target_indices:
        poly = polys[pidx]
        topo_area = poly_info[pidx].get("topo_area", 0.0)

        # Bỏ qua polygon có diện tích <= 0 (tránh chia cho 0)
        if topo_area <= 0:
            continue

        # Tìm tất cả text L13 gần polygon (trong 100m)
        candidates = []
        for (idx13, x13, y13, so_thua) in txt13_unused:
            try:
                dist13 = poly.distance(Point(x13, y13))
                if dist13 > 100.0:
                    continue

                # Tìm L4 gần L13 này nhất
                best_l4 = None
                best_l4_dist = float('inf')
                for (idx4, x4, y4, area) in txt4_unused:
                    dist_l13_l4 = math.sqrt(dist2(x13, y13, x4, y4))
                    if dist_l13_l4 < best_l4_dist:
                        best_l4_dist = dist_l13_l4
                        best_l4 = (idx4, x4, y4, area)

                # Tính độ chênh lệch diện tích
                if best_l4 and best_l4_dist < 50.0:  # L4 phải gần L13 trong 50m
                    area_val = float(best_l4[3])
                    area_diff = abs(area_val - topo_area)
                    area_diff_pct = (area_diff / topo_area * 100) if topo_area > 0.01 else 999
                else:
                    area_val = None
                    area_diff = float('inf')
                    area_diff_pct = 999

                candidates.append({
                    "l13_idx": idx13,
                    "l13_pos": (x13, y13),
                    "so_thua": int(so_thua),
                    "dist_poly": dist13,
                    "l4_idx": best_l4[0] if best_l4 else None,
                    "l4_pos": best_l4[1:3] if best_l4 else None,
                    "area": area_val,
                    "area_diff": area_diff,
                    "area_diff_pct": area_diff_pct
                })
            except Exception as e:
                continue

        if not candidates:
            continue

        # Sắp xếp: Ưu tiên diện tích khớp, sau đó khoảng cách gần
        candidates.sort(key=lambda x: (x["area_diff"], x["dist_poly"]))
        best = candidates[0]

        # Kiểm tra điều kiện khoảng cách
        if best["dist_poly"] > 100.0:
            continue

        # Validation Logic
        if best["area"] is not None:
            # [USER REQ] Threshold = 50m² như đã yêu cầu
            if best["area_diff"] > 50.0:
                continue
        else:
            if best["dist_poly"] > 30.0:
                continue

        # Gán thông tin
        info = poly_info[pidx]

        # Safety check: Prevent overwriting
        if info.get("so_thua") is not None:
            continue

        info["so_thua"] = best["so_thua"]

        if best["area"] is not None:
            info["label_area"] = best["area"]
            info["label_src"] = "Arrow-NearestText"
            info["note"] = f"[Text gần nhất] Cách {best['dist_poly']:.1f}m, chênh DT {best['area_diff']:.1f}m² ({best['area_diff_pct']:.1f}%)"
        else:
            info["label_src"] = "Arrow-NearestText"
            info["note"] = f"[Text gần nhất] Cách {best['dist_poly']:.1f}m (không có DT)"

        # Đánh dấu text đã dùng
        txt13_unused = [(i, x, y, s) for (i, x, y, s) in txt13_unused if i != best["l13_idx"]]
        if best["l4_idx"] is not None:
            txt4_unused = [(i, x, y, a) for (i, x, y, a) in txt4_unused if i != best["l4_idx"]]

        assigned_count += 1

    print(f"[DEBUG] Tổng số polygon đã gán (Arrow): {assigned_count}")


# =========================================================
# ARROW DETECTION HELPERS (NEW)
# =========================================================


def detect_arrows_from_rows(rows):
    """
    Phát hiện mũi tên từ TẤT CẢ các entity tuyến tính
    
    Mũi tên có thể là:
    - LINE ngắn (1-100m)
    - LWPOLYLINE với 2+ điểm
    - POLYLINE (bất kỳ số điểm) - lấy điểm đầu và cuối
    
    KHÔNG QUAN TÂM: layer, màu, linetype
    
    Returns:
        List of arrows
    """
    import math
    arrows = []
    
    # Debug counters
    line_count = 0
    lwpoly_count = 0
    poly_count = 0
    line_too_short = 0
    line_too_long = 0
    lwpoly_too_short = 0
    lwpoly_too_long = 0
    poly_too_short = 0
    poly_too_long = 0
    lwpoly_no_points = 0
    poly_no_points = 0
    
    for row in rows:
        dxftype = row.get('dxftype', '').upper()
        
        # Kiểm tra LINE entity
        if dxftype == 'LINE':
            line_count += 1
            x1 = row.get('x1') or row.get('x')
            y1 = row.get('y1') or row.get('y')
            x2 = row.get('x2')
            y2 = row.get('y2')
            
            if x1 is not None and y1 is not None and x2 is not None and y2 is not None:
                length = math.sqrt((x2-x1)**2 + (y2-y1)**2)
                
                if length <= 1.0:
                    line_too_short += 1
                elif length >= 100.0:
                    line_too_long += 1
                else:
                    angle = math.atan2(y2-y1, x2-x1)
                    arrows.append({
                        'start': (x1, y1),
                        'end': (x2, y2),
                        'length': length,
                        'angle': angle,
                        'type': 'LINE'
                    })
        
        # Kiểm tra LWPOLYLINE
        elif dxftype == 'LWPOLYLINE':
            lwpoly_count += 1
            points = row.get('points', [])
            if len(points) >= 2:
                x1, y1 = points[0]
                x2, y2 = points[-1]
                length = math.sqrt((x2-x1)**2 + (y2-y1)**2)
                
                if length <= 1.0:
                    lwpoly_too_short += 1
                elif length >= 100.0:
                    lwpoly_too_long += 1
                else:
                    angle = math.atan2(y2-y1, x2-x1)
                    arrows.append({
                        'start': (x1, y1),
                        'end': (x2, y2),
                        'length': length,
                        'angle': angle,
                        'type': 'LWPOLYLINE'
                    })
            else:
                lwpoly_no_points += 1
        
        # Kiểm tra POLYLINE
        elif dxftype == 'POLYLINE':
            poly_count += 1
            points = row.get('points', [])
            if len(points) >= 2:
                x1, y1 = points[0]
                x2, y2 = points[-1]
                length = math.sqrt((x2-x1)**2 + (y2-y1)**2)
                
                if length <= 1.0:
                    poly_too_short += 1
                elif length >= 100.0:
                    poly_too_long += 1
                else:
                    angle = math.atan2(y2-y1, x2-x1)
                    arrows.append({
                        'start': (x1, y1),
                        'end': (x2, y2),
                        'length': length,
                        'angle': angle,
                        'type': 'POLYLINE'
                    })
            else:
                poly_no_points += 1
    
    # Debug output (sẽ được log ra console)
    print(f"\n[DEBUG] Arrow Detection Statistics:")
    print(f"  LINE: {line_count} total, {len([a for a in arrows if a['type']=='LINE'])} arrows")
    print(f"    (too short: {line_too_short}, too long: {line_too_long})")
    print(f"  LWPOLYLINE: {lwpoly_count} total, {len([a for a in arrows if a['type']=='LWPOLYLINE'])} arrows")
    print(f"    (too short: {lwpoly_too_short}, too long: {lwpoly_too_long}, no points: {lwpoly_no_points})")
    print(f"  POLYLINE: {poly_count} total, {len([a for a in arrows if a['type']=='POLYLINE'])} arrows")
    print(f"    (too short: {poly_too_short}, too long: {poly_too_long}, no points: {poly_no_points})")
    print(f"  TOTAL ARROWS: {len(arrows)}\n")
    
    return arrows


def find_text_near_arrow_tail(arrow, unused_l13_texts, max_distance=10.0):
    """
    Tìm text L13 gần đuôi mũi tên nhất
    
    Args:
        arrow: Dict chứa thông tin mũi tên
        unused_l13_texts: List of (x, y, so_thua)
        max_distance: Khoảng cách tối đa (m)
    
    Returns:
        (x, y, so_thua) hoặc None
    """
    import math
    tail_x, tail_y = arrow['start']
    
    best_text = None
    best_dist = float('inf')
    
    for x, y, so_thua in unused_l13_texts:
        dist = math.sqrt((x - tail_x)**2 + (y - tail_y)**2)
        
        if dist < best_dist and dist < max_distance:
            best_dist = dist
            best_text = (x, y, so_thua)
    
    return best_text


def find_polygon_at_arrow_head(arrow, polys, tolerance=5.0):
    """
    Tìm polygon mà đầu mũi tên chỉ vào
    
    Args:
        arrow: Dict chứa thông tin mũi tên
        polys: List of Shapely Polygon
        tolerance: Khoảng cách tối đa từ đầu mũi tên đến polygon (m)
    
    Returns:
        polygon index hoặc None
    """
    from shapely.geometry import Point
    
    head_x, head_y = arrow['end']
    head_point = Point(head_x, head_y)
    
    # Tạo LineString từ mũi tên để kiểm tra giao với polygon
    from shapely.geometry import LineString
    arrow_line = LineString([arrow['start'], arrow['end']])
    
    # Tìm polygon mà mũi tên chạm vào
    for idx, poly in enumerate(polys):
        # Kiểm tra 1: Đầu mũi tên nằm TRONG polygon
        if poly.contains(head_point):
            return idx
        
        # Kiểm tra 2: Đầu mũi tên nằm TRÊN biên polygon (rất gần, < 10cm)
        if poly.boundary.distance(head_point) < 0.1:
            return idx
        
        # Kiểm tra 3: Mũi tên GIAO với polygon (chạm vào)
        if arrow_line.intersects(poly):
            return idx
    
    return None



# =========================================================
# INTELLIGENT ASSIGNMENT HELPERS (NEW)
# =========================================================

def find_text_clusters_in_polygon(poly, rows, max_cluster_distance=20.0):
    """
    Tìm tất cả text clusters (L13, L2, L4) trong một polygon.
    
    Args:
        poly: Shapely Polygon
        rows: Danh sách tất cả entities từ DXF
        max_cluster_distance: Khoảng cách tối đa để nhóm text thành cluster (m)
    
    Returns:
        List of clusters, mỗi cluster là dict:
        {
            'l13': (x, y, so_thua),
            'l2': (x, y, ma_loai_dat) hoặc None,
            'l4': (x, y, dien_tich) hoặc None,
            'center': (cx, cy),
            'completeness': 'full' | 'partial' | 'minimal'
        }
    """
    from shapely.geometry import Point
    
    # [FIX] KHÔNG DÙNG BUFFER - Chỉ lấy text THỰC SỰ nằm trong polygon
    # Buffer gây ra lỗi: text của thửa lớn bị lan sang thửa nhỏ bên cạnh
    
    # [MỚI] Kiểm tra text có dấu / không (text nằm ngang)
    slash_clusters = []
    for row in rows:
        if row.get("dxftype") in ["TEXT", "MTEXT"]:
            text = str(row.get("text", "")).strip()
            if "/" in text:
                x, y = row.get("x"), row.get("y")
                if x is not None and y is not None:
                    pt = Point(x, y)
                    if poly.contains(pt):
                        # Parse text có dấu /
                        parsed = parse_slash_separated_text(text)
                        if parsed and parsed.get('l13'):
                            # Tạo cluster trực tiếp từ text đã parse
                            cluster = {
                                'l13': (x, y, parsed['l13']),
                                'l2': (x, y, parsed['l2']) if parsed.get('l2') else None,
                                'l4': (x, y, parsed['l4']) if parsed.get('l4') else None,
                                'center': (x, y),
                                'slash_text': True  # Đánh dấu đây là text có dấu /
                            }
                            
                            # Xác định độ đầy đủ
                            if cluster['l2'] and cluster['l4']:
                                cluster['completeness'] = 'full'
                            elif cluster['l4']:
                                cluster['completeness'] = 'partial'
                            else:
                                cluster['completeness'] = 'minimal'
                            
                            slash_clusters.append(cluster)
    
    # Nếu có text có dấu /, return luôn (ưu tiên text nằm ngang)
    if slash_clusters:
        return slash_clusters
    
    l13_texts = []  # [(x, y, so_thua), ...]
    l2_texts = []   # [(x, y, ma_loai_dat), ...]
    l4_texts = []   # [(x, y, dien_tich), ...]

    
    # [FIX] L13 (Số thửa) - CHỈ lấy text THỰC SỰ nằm TRONG polygon
    # KHÔNG dùng buffer/distance để tránh lấy nhầm text của thửa bên cạnh
    for row in collect_text_by_level(rows, 13):
        x, y = row.get("x"), row.get("y")
        if x is not None and y is not None:
            pt = Point(x, y)
            # CHỈ lấy text nằm TRONG polygon
            if poly.contains(pt):
                text = str(row.get("text", "")).strip()
                try:
                    text_clean = re.sub(r'\D', '', text)
                    if text_clean:
                        so_thua = int(text_clean)
                        l13_texts.append((x, y, so_thua))
                except:
                    pass
    
    # [FIX] L2 (Mã loại đất) - CHỈ lấy text THỰC SỰ nằm TRONG polygon
    for row in collect_text_by_level(rows, 2):
        x, y = row.get("x"), row.get("y")
        if x is not None and y is not None:
            pt = Point(x, y)
            # CHỈ lấy text nằm TRONG polygon
            if poly.contains(pt):
                text = str(row.get("text", "")).strip()
                if text:
                    l2_texts.append((x, y, text))
    
    # [FIX] L4 (Diện tích) - CHỈ lấy text THỰC SỰ nằm TRONG polygon
    for row in collect_text_by_level(rows, 4):
        x, y = row.get("x"), row.get("y")
        if x is not None and y is not None:
            pt = Point(x, y)
            # CHỈ lấy text nằm TRONG polygon
            if poly.contains(pt):
                text = str(row.get("text", "")).strip()
                try:
                    t = text.replace(",", ".").replace(" ", "")
                    area = float(t)
                    l4_texts.append((x, y, area))
                except:
                    pass
    
    # Nếu không có L13 thì không có cluster
    if not l13_texts:
        return []
    
    # [MỚI] Gom text L13 theo hàng ngang (Y coordinate gần nhau)
    # Điều này giúp xử lý tốt hơn các text được sắp xếp theo hàng ngang
    l13_groups = []
    for x13, y13, so_thua in l13_texts:
        # Tìm nhóm có Y gần nhau (< 2m - cùng hàng ngang)
        found_group = False
        for group in l13_groups:
            if abs(group['y_avg'] - y13) < 2.0:
                group['texts'].append((x13, y13, so_thua))
                # Cập nhật Y trung bình
                group['y_avg'] = sum(t[1] for t in group['texts']) / len(group['texts'])
                found_group = True
                break
        
        if not found_group:
            l13_groups.append({'y_avg': y13, 'texts': [(x13, y13, so_thua)]})
    
    # Nhóm thành clusters: Mỗi L13 là tâm của 1 cluster
    # Ưu tiên tìm L2/L4 cùng hàng ngang (Y gần nhau)
    clusters = []
    for x13, y13, so_thua in l13_texts:
        cluster = {
            'l13': (x13, y13, so_thua),
            'l2': None,
            'l4': None,
            'center': (x13, y13)
        }
        
        # [CẢI TIẾN] Tìm L2 gần nhất - ƯU TIÊN cùng hàng ngang (Y gần nhau)
        min_dist_l2 = float('inf')
        best_l2_score = float('inf')  # Score = y_diff * 10 + euclidean_dist
        
        for x2, y2, ma_loai in l2_texts:
            dist = math.sqrt((x2 - x13)**2 + (y2 - y13)**2)
            y_diff = abs(y2 - y13)
            
            # Score: Ưu tiên Y gần nhau (cùng hàng ngang)
            score = y_diff * 10 + dist
            
            if score < best_l2_score and dist <= max_cluster_distance:
                best_l2_score = score
                min_dist_l2 = dist
                cluster['l2'] = (x2, y2, ma_loai)
        
        # [CẢI TIẾN] Tìm L4 gần nhất - ƯU TIÊN cùng hàng ngang (Y gần nhau)
        min_dist_l4 = float('inf')
        best_l4_score = float('inf')
        
        for x4, y4, area in l4_texts:
            dist = math.sqrt((x4 - x13)**2 + (y4 - y13)**2)
            y_diff = abs(y4 - y13)
            
            # Score: Ưu tiên Y gần nhau (cùng hàng ngang)
            score = y_diff * 10 + dist
            
            if score < best_l4_score and dist <= max_cluster_distance:
                best_l4_score = score
                min_dist_l4 = dist
                cluster['l4'] = (x4, y4, area)
        
        # Xác định độ đầy đủ
        if cluster['l2'] and cluster['l4']:
            cluster['completeness'] = 'full'
        elif cluster['l4']:
            cluster['completeness'] = 'partial'
        else:
            cluster['completeness'] = 'minimal'
        
        clusters.append(cluster)
    
    return clusters


def calculate_cluster_score(cluster, poly_centroid, topo_area):
    """
    Tính điểm cho một cluster dựa trên:
    - Khoảng cách đến tâm polygon (càng gần càng tốt)
    - Độ chênh lệch diện tích (càng nhỏ càng tốt)
    - Độ đầy đủ của cluster (full > partial > minimal)
    
    Args:
        cluster: Dict chứa thông tin cluster
        poly_centroid: Tâm của polygon (x, y)
        topo_area: Diện tích topo của polygon
    
    Returns: 
        score (float, càng nhỏ càng tốt)
    """
    cx, cy = cluster['center']
    pcx, pcy = poly_centroid.x, poly_centroid.y
    
    # Khoảng cách đến tâm (chuẩn hóa)
    dist_to_center = math.sqrt((cx - pcx)**2 + (cy - pcy)**2)
    
    # Độ chênh lệch diện tích
    if cluster['l4'] and topo_area > 0:
        area_diff = abs(cluster['l4'][2] - topo_area)
        area_diff_pct = (area_diff / topo_area) * 100
    else:
        area_diff = float('inf')
        area_diff_pct = 999
    
    # Điểm theo độ đầy đủ
    completeness_score = {
        'full': 0,
        'partial': 100,
        'minimal': 200
    }.get(cluster['completeness'], 300)
    
    # Tổng điểm (trọng số: diện tích quan trọng nhất, sau đó là khoảng cách, cuối cùng là độ đầy đủ)
    score = area_diff_pct * 10 + dist_to_center * 0.1 + completeness_score
    
    return score


def assign_single_polygon_intelligent(poly, poly_info, rows, topo_area, debug_log=None):
    """
    Gán thông tin cho 1 polygon theo 3 trường hợp:
    
    Case 1: Có 1 cluster duy nhất -> Gán trực tiếp
    Case 2: Có 1 cluster đầy đủ (L13+L2+L4) + N clusters không đầy đủ (chỉ L13 hoặc L13+L4)
            -> Gán cluster đầy đủ, kiểm tra diện tích
            -> Nếu lệch > 50m² thì thử clusters khác
    Case 3: Có >= 2 clusters đầy đủ
            -> ƯU TIÊN: Chọn cluster có diện tích KHỚP NHẤT với topo
            -> Nếu không có cluster nào lệch <= 50m² thì chọn cluster gần tâm nhất
    
    Args:
        poly: Shapely Polygon
        poly_info: Dict chứa thông tin polygon
        rows: Danh sách entities từ DXF
        topo_area: Diện tích topo
        debug_log: Hàm log để debug (optional)
    
    Returns: 
        True nếu gán thành công
    """
    # Tìm clusters trong polygon
    clusters = find_text_clusters_in_polygon(poly, rows, max_cluster_distance=20.0)
    
    if not clusters:
        return False
    
    poly_centroid = poly.centroid
    
    # Phân loại clusters
    full_clusters = [c for c in clusters if c['completeness'] == 'full']
    partial_clusters = [c for c in clusters if c['completeness'] == 'partial']
    minimal_clusters = [c for c in clusters if c['completeness'] == 'minimal']
    
    # === CASE 1: Chỉ có 1 cluster ===
    if len(clusters) == 1:
        cluster = clusters[0]
        if debug_log:
            debug_log(f"   [Case 1] Chỉ có 1 cluster ({cluster['completeness']})")
        
        # Gán thông tin
        poly_info["so_thua"] = cluster['l13'][2]
        if cluster['l2']:
            poly_info["ma_loai_dat"] = cluster['l2'][2]
        if cluster['l4']:
            poly_info["label_area"] = cluster['l4'][2]
            poly_info["label_src"] = "Step3-Single"
        else:
            poly_info["label_src"] = "Step3-Single-NoArea"
        return True
    
    # === CASE 2: Có 1 cluster đầy đủ + N clusters khác (chỉ L13 hoặc L13+L4) ===
    if len(full_clusters) == 1:
        if debug_log:
            debug_log(f"   [Case 2] 1 cluster đầy đủ + {len(clusters)-1} cluster khác")
        
        # Thử cluster đầy đủ trước
        cluster = full_clusters[0]
        area_diff = abs(cluster['l4'][2] - topo_area) if cluster['l4'] else float('inf')
        
        # [USER REQ] Threshold = 50m²
        if area_diff <= 50.0:
            # OK, gán luôn
            poly_info["so_thua"] = cluster['l13'][2]
            poly_info["ma_loai_dat"] = cluster['l2'][2] if cluster['l2'] else None
            poly_info["label_area"] = cluster['l4'][2] if cluster['l4'] else None
            poly_info["label_src"] = "Step3-FullCluster"
            if debug_log:
                debug_log(f"      -> Gán cluster đầy đủ (lệch {area_diff:.1f}m²)")
            return True
        else:
            # Lệch > 50m², thử các cluster khác (partial hoặc minimal)
            if debug_log:
                debug_log(f"      -> Cluster đầy đủ lệch {area_diff:.1f}m² > 50m², thử cluster khác...")
            
            other_clusters = partial_clusters + minimal_clusters
            if other_clusters:
                # Tìm cluster có diện tích khớp nhất
                best_alt = None
                best_alt_diff = float('inf')
                
                for alt_cluster in other_clusters:
                    if alt_cluster['l4']:
                        alt_diff = abs(alt_cluster['l4'][2] - topo_area)
                        if alt_diff < best_alt_diff:
                            best_alt_diff = alt_diff
                            best_alt = alt_cluster
                
                # Nếu cluster thay thế lệch <= 50m², gán nó
                if best_alt and best_alt_diff <= 50.0:
                    poly_info["so_thua"] = best_alt['l13'][2]
                    poly_info["ma_loai_dat"] = best_alt['l2'][2] if best_alt['l2'] else None
                    poly_info["label_area"] = best_alt['l4'][2]
                    poly_info["label_src"] = "Step3-Alternative"
                    if debug_log:
                        debug_log(f"      -> Gán cluster thay thế (lệch {best_alt_diff:.1f}m²)")
                    return True
            
            # Không tìm được cluster phù hợp, vẫn gán cluster đầy đủ nhưng đánh dấu cảnh báo
            poly_info["so_thua"] = cluster['l13'][2]
            poly_info["ma_loai_dat"] = cluster['l2'][2] if cluster['l2'] else None
            poly_info["label_area"] = cluster['l4'][2] if cluster['l4'] else None
            poly_info["label_src"] = "Step3-FullCluster-Warning"
            poly_info["note"] = f"[Cảnh báo] Diện tích lệch {area_diff:.1f}m²"
            if debug_log:
                debug_log(f"      -> Gán cluster đầy đủ dù lệch nhiều (cảnh báo)")
            return True
    
    # === CASE 3: Có >= 2 clusters đầy đủ ===
    if len(full_clusters) >= 2:
        if debug_log:
            debug_log(f"   [Case 3] {len(full_clusters)} clusters đầy đủ")
        
        # [USER REQ] ƯU TIÊN: Tìm cluster có diện tích KHỚP NHẤT
        # Sắp xếp theo độ lệch diện tích (nhỏ nhất = tốt nhất)
        sorted_by_area = []
        for cluster in full_clusters:
            if cluster['l4']:
                area_diff = abs(cluster['l4'][2] - topo_area)
                dist_to_center = math.sqrt(
                    (cluster['center'][0] - poly_centroid.x)**2 + 
                    (cluster['center'][1] - poly_centroid.y)**2
                )
                sorted_by_area.append((area_diff, dist_to_center, cluster))
        
        # Sắp xếp: Ưu tiên lệch diện tích nhỏ, sau đó là khoảng cách đến tâm
        sorted_by_area.sort(key=lambda x: (x[0], x[1]))
        
        if sorted_by_area:
            # Thử từng cluster theo thứ tự (ít lệch nhất trước)
            for area_diff, dist_to_center, cluster in sorted_by_area:
                # [USER REQ] Threshold = 50m²
                if area_diff <= 50.0:
                    # Tìm được cluster phù hợp
                    poly_info["so_thua"] = cluster['l13'][2]
                    poly_info["ma_loai_dat"] = cluster['l2'][2] if cluster['l2'] else None
                    poly_info["label_area"] = cluster['l4'][2] if cluster['l4'] else None
                    poly_info["label_src"] = "Step3-BestMatch"
                    if debug_log:
                        debug_log(f"      -> Gán cluster khớp nhất (lệch {area_diff:.1f}m², cách tâm {dist_to_center:.1f}m)")
                    return True
            
            # Không cluster nào lệch <= 50m², chọn cluster có diện tích gần nhất
            best_area_diff, best_dist, best_cluster = sorted_by_area[0]
            
            poly_info["so_thua"] = best_cluster['l13'][2]
            poly_info["ma_loai_dat"] = best_cluster['l2'][2] if best_cluster['l2'] else None
            poly_info["label_area"] = best_cluster['l4'][2] if best_cluster['l4'] else None
            poly_info["label_src"] = "Step3-BestArea-Warning"
            poly_info["note"] = f"[Cảnh báo] Nhiều cluster, chọn gần DT nhất nhưng lệch {best_area_diff:.1f}m²"
            if debug_log:
                debug_log(f"      -> Gán cluster lệch ít nhất dù > 50m² (lệch {best_area_diff:.1f}m²)")
            return True
    
    # === CASE DEFAULT: Chỉ có clusters không đầy đủ ===
    # Ưu tiên cluster có diện tích, nếu không thì chọn gần tâm nhất
    if debug_log:
        debug_log(f"   [Case Default] {len(clusters)} cluster không đầy đủ")
    
    # Tìm cluster có diện tích và khớp nhất
    clusters_with_area = [c for c in clusters if c['l4']]
    
    if clusters_with_area:
        # Sắp xếp theo độ lệch diện tích
        clusters_with_area.sort(key=lambda c: abs(c['l4'][2] - topo_area))
        cluster = clusters_with_area[0]
    else:
        # Không có cluster nào có diện tích, chọn gần tâm nhất
        clusters.sort(key=lambda c: math.sqrt(
            (c['center'][0] - poly_centroid.x)**2 + 
            (c['center'][1] - poly_centroid.y)**2
        ))
        cluster = clusters[0]
    
    poly_info["so_thua"] = cluster['l13'][2]
    poly_info["ma_loai_dat"] = cluster['l2'][2] if cluster['l2'] else None
    poly_info["label_area"] = cluster['l4'][2] if cluster['l4'] else None
    poly_info["label_src"] = "Step3-Incomplete"
    if debug_log:
        debug_log(f"      -> Gán cluster không đầy đủ")
    return True











class StepByStepWindow(QMainWindow):
    """Cửa sổ chính với quy trình từng bước"""

    def __init__(self):
        super().__init__()
        if not _HAS_QGIS:
            QMessageBox.critical(None, "Thiếu QGIS", "Không có qgis.core. Hãy chạy bằng python-qgis.bat")
            raise RuntimeError("No QGIS")

        self.setWindowTitle("TOPO vs NHÃN - Quy trình từng bước (Map Integration)")
        self.resize(1600, 900)

        # ===== STATE VARIABLES =====
        # Multi-file support
        self.files = []  # List of file data structures
        self.selected_levels = None  # Shared level selection

        # Legacy single-file variables (for backward compatibility)
        self.dxf_path = None
        self.rows = None
        self.polys = None
        self.poly_info = None
        self.clusters = None
        self.small_parcel_map = {}
        self.boundary_levels = [10, 23, 31, 32]
        self.current_step = 0
        self.is_batch_mode = False # Flag kiểm soát thông báo khi chạy nhiều file

        # Map Widget (sẽ khởi tạo trong UI)
        self.map_widget = None

        # ===== UI SETUP =====
        self._setup_ui()

    def _setup_ui(self):
        root = QWidget()
        self.setCentralWidget(root)
        main_layout = QHBoxLayout(root)

        splitter = QSplitter(Qt.Horizontal)
        main_layout.addWidget(splitter)

        # ===== LEFT PANEL: Controls =====
        # ===== LEFT PANEL: Controls =====
        left = QWidget()
        left_layout = QVBoxLayout(left)
        left_layout.setSpacing(15)

        # STYLESHEET - Modern Professional Design
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f7fa;
            }
            QGroupBox {
                font-weight: bold;
                font-size: 13px;
                border: 2px solid #3498db;
                border-radius: 8px;
                margin-top: 12px;
                padding-top: 15px;
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #ffffff, stop:1 #f8f9fa);
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 15px;
                padding: 0 8px;
                color: #2c3e50;
                background-color: white;
            }
            QPushButton {
                border-radius: 6px;
                padding: 8px 12px;
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #ecf0f1, stop:1 #bdc3c7);
                border: 1px solid #95a5a6;
                color: #2c3e50;
                font-weight: 500;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #3498db, stop:1 #2980b9);
                border: 1px solid #2980b9;
                color: white;
            }
            QPushButton:pressed {
                background: #2980b9;
            }
            QPushButton:disabled {
                background: #ecf0f1;
                color: #95a5a6;
                border: 1px solid #bdc3c7;
            }
            QLineEdit {
                padding: 8px;
                border: 2px solid #bdc3c7;
                border-radius: 6px;
                background-color: white;
                selection-background-color: #3498db;
            }
            QLineEdit:focus {
                border: 2px solid #3498db;
            }
            QLineEdit:read-only {
                background-color: #ecf0f1;
                color: #7f8c8d;
            }
        """)


        # GROUP 1: INPUT & SETUP
        gb_setup = QGroupBox("1️⃣ THIẾT LẬP (SETUP)")
        l_setup = QVBoxLayout(gb_setup)
        l_setup.setSpacing(10)

        # Row 1: Load DXF
        row1 = QHBoxLayout()
        self.ed_dxf = QLineEdit()
        self.ed_dxf.setReadOnly(True)
        self.ed_dxf.setPlaceholderText("Chưa chọn file DXF...")
        
        self.btn_load_dxf = QPushButton("📁 Chọn DXF")
        self.btn_load_dxf.setIcon(self.style().standardIcon(QStyle.SP_DialogOpenButton))
        self.btn_load_dxf.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #f39c12, stop:1 #e67e22);
                color: white;
                font-weight: bold;
                border: none;
                border-radius: 6px;
                padding: 8px 15px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #f1c40f, stop:1 #f39c12);
            }
        """)
        self.btn_load_dxf.clicked.connect(self.on_load_dxf)
        
        row1.addWidget(self.ed_dxf, 1)
        row1.addWidget(self.btn_load_dxf)
        l_setup.addLayout(row1)

        # Row 2: Output Dir (Moved UP)
        row2 = QHBoxLayout()
        self.ed_out_dir = QLineEdit()
        self.ed_out_dir.setPlaceholderText("Thư mục xuất kết quả (Mặc định: cùng thư mục DXF)")
        
        self.btn_pick_out = QPushButton(" Output Folder")
        self.btn_pick_out.setIcon(self.style().standardIcon(QStyle.SP_DirOpenIcon))
        self.btn_pick_out.clicked.connect(self.on_pick_out_dir)
        
        row2.addWidget(self.ed_out_dir, 1)
        row2.addWidget(self.btn_pick_out)
        l_setup.addLayout(row2)

        # Row 3: Level Topo - Hiển thị các level ĐÃ CHỌN
        row3 = QHBoxLayout()
        lbl_lv = QLabel("Level Topo:")
        self.ed_levels = QLineEdit()
        self.ed_levels.setReadOnly(True)
        self.ed_levels.setText(str(self.boundary_levels))  # Mặc định: [10, 23, 31, 32]
        
        self.btn_pick_levels = QPushButton(" Chọn...")
        self.btn_pick_levels.setIcon(self.style().standardIcon(QStyle.SP_FileDialogDetailedView))
        self.btn_pick_levels.clicked.connect(self.on_pick_levels)
        
        row3.addWidget(lbl_lv)
        row3.addWidget(self.ed_levels, 1)
        row3.addWidget(self.btn_pick_levels)
        l_setup.addLayout(row3)
        
        # Row 4: Label Config (NEW)
        row4 = QHBoxLayout()
        lbl_cfg = QLabel("Cấu hình nhãn:")
        self.ed_labels_cfg = QLineEdit()
        self.ed_labels_cfg.setReadOnly(True)
        self.ed_labels_cfg.setText("Mặc định (13, 4, 2)")
        
        self.btn_cfg_labels = QPushButton(" Cấu hình...")
        self.btn_cfg_labels.setIcon(self.style().standardIcon(QStyle.SP_FileDialogDetailedView))
        self.btn_cfg_labels.clicked.connect(self.on_config_labels)
        
        row4.addWidget(lbl_cfg)
        row4.addWidget(self.ed_labels_cfg, 1)
        row4.addWidget(self.btn_cfg_labels)
        l_setup.addLayout(row4)
        
        left_layout.addWidget(gb_setup) # Add Setup Group




        # GROUP 2: PROCESS
        gb_process = QGroupBox("2️⃣ XỬ LÝ & KIỂM TRA (PROCESS)")
        l_process = QVBoxLayout(gb_process)
        
        lbl_info = QLabel("✨ Chức năng này sẽ chạy tự động kiểm tra LẦN LƯỢT từng file:\n"
                          "   • Chạy Topo -> Gán thông tin -> Sửa lỗi.\n"
                          "   • Chỉ xuất báo cáo nếu phát hiện lỗi.\n"
                          "   • Báo cáo tổng hợp cuối cùng.")
        lbl_info.setStyleSheet("color: #555; font-style: italic; margin-bottom: 10px;")
        lbl_info.setWordWrap(True)
        l_process.addWidget(lbl_info)

        self.btn_run_full = QPushButton("▶ CHẠY KIỂM TRA (RUN BATCH)")
        self.btn_run_full.setEnabled(False)
        self.btn_run_full.setMinimumHeight(65)
        self.btn_run_full.setIcon(self.style().standardIcon(QStyle.SP_MediaPlay))
        self.btn_run_full.setStyleSheet("""
            QPushButton {
                font-weight: bold; 
                font-size: 15px; 
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #27ae60, stop:1 #229954);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 10px;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #2ecc71, stop:1 #27ae60);
            }
            QPushButton:pressed {
                background: #1e8449;
            }
            QPushButton:disabled {
                background-color: #f0f0f0;
                color: #999;
                border: 1px solid #ccc;
            }
        """)
        self.btn_run_full.clicked.connect(self.on_run_full_check)
        l_process.addWidget(self.btn_run_full)

        left_layout.addWidget(gb_process)
        
        # ... (Hidden buttons remain hidden/minimized)

        # HIDDEN BUTTONS (Keep reference code but hide from UI)
        # We need to keep the variables self.btn_* because other methods might reference them via setEnabled
        # To handle this cleanly, we'll create dummy buttons or just not add them to layout
        # But wait, existing logic (on_load_dxf) calls self.btn_run_topo.setEnabled(True)
        # So we MUST instantiate them. We will just make them invisible.
        self.btn_run_topo = QPushButton()
        self.btn_assign_basic = QPushButton()
        self.btn_assign_arrow = QPushButton()
        self.btn_assign_small = QPushButton()
        self.btn_check = QPushButton()


        # Log
        gb_log = QGroupBox("📋 Log")
        log_layout = QVBoxLayout(gb_log)
        self.txt_log = QTextEdit()
        self.txt_log.setReadOnly(True)
        self.txt_log.setMaximumHeight(150)
        log_layout.addWidget(self.txt_log)
        left_layout.addWidget(gb_log)

        left_layout.addStretch(1)

        # ===== RIGHT PANEL: Map + Table =====
        right = QWidget()
        right_layout = QVBoxLayout(right)

        # Vertical Splitter cho Map và Table
        v_splitter = QSplitter(Qt.Vertical)

        # 1. Map Widget (Top)
        if _HAS_MAP_WIDGET:
            gb_map = QGroupBox("🗺️ Bản đồ")
            map_layout = QVBoxLayout(gb_map)
            map_layout.setContentsMargins(0, 0, 0, 0)
            self.map_widget = MapCanvasWidget()
            map_layout.addWidget(self.map_widget)
            v_splitter.addWidget(gb_map)
        else:
            lbl_no_map = QLabel("⚠️ Không tìm thấy module bản đồ")
            v_splitter.addWidget(lbl_no_map)

        # 2. Table Result (Bottom)
        gb_result = QGroupBox("📊 Kết quả")
        result_layout = QVBoxLayout(gb_result)

        self.tbl_result = QTableWidget(0, 9)
        self.tbl_result.setHorizontalHeaderLabels([
            "STT", "Số thửa", "Mã loại đất",
            "DT nhãn", "DT topo", "Chênh lệch",
            "Kết quả", "Nguồn gán", "Ghi chú"
        ])

        # Style header
        header = self.tbl_result.horizontalHeader()
        if hasattr(header, 'setSectionResizeMode'):
            header.setSectionResizeMode(QHeaderView.Stretch)

        self.tbl_result.setAlternatingRowColors(True)
        # [FIX] Connect double click signal
        self.tbl_result.doubleClicked.connect(self.on_table_double_click)
        
        result_layout.addWidget(self.tbl_result)
        v_splitter.addWidget(gb_result)

        # Set splitter sizes (Map gets more space)
        v_splitter.setStretchFactor(0, 2)
        v_splitter.setStretchFactor(1, 1)

        right_layout.addWidget(v_splitter)

        splitter.addWidget(left)
        splitter.addWidget(right)
        splitter.setStretchFactor(0, 0)
        splitter.setStretchFactor(1, 1)

        self.setFont(QFont("Arial", 10))

    def log(self, msg: str):
        self.txt_log.append(msg)
        # Auto scroll
        sb = self.txt_log.verticalScrollBar()
        sb.setValue(sb.maximum())

    def update_map_view(self):
        """Helper to update map if available"""
        if self.map_widget and self.polys:
            try:
                map_name = ""
                if self.dxf_path:
                    # Lấy tên file làm số tờ (theo yêu cầu user)
                    map_name = os.path.splitext(os.path.basename(self.dxf_path))[0]

                self.map_widget.update_map(self.polys, self.poly_info, self.rows, map_name=map_name)
                self.log("🗺️ Đã cập nhật bản đồ")
            except Exception as e:
                self.log(f"⚠️ Lỗi cập nhật bản đồ: {e}")

    def on_table_double_click(self, index):
        """Zoom đến thửa khi double-click vào bảng"""
        try:
            from PyQt5.QtCore import Qt
            # Lấy STT từ cột đầu tiên (index 0)
            row = index.row()
            stt_item = self.tbl_result.item(row, 0)
            if stt_item:
                # Ưu tiên lấy index thực từ dữ liệu UserRole
                poly_index = stt_item.data(Qt.UserRole)
                if poly_index is None:
                    stt = int(stt_item.text())
                    # STT bắt đầu từ 1, nhưng polygon index bắt đầu từ 0
                    poly_index = stt - 1
                
                # Zoom đến polygon và highlight màu vàng
                if self.map_widget and 0 <= poly_index < len(self.polys):
                    self.map_widget.zoom_to_index(poly_index)
                    self.map_widget.highlight_polygon(poly_index)
                    self.log(f"🔍 Đã zoom và highlight thửa ở vị trí {poly_index}")
        except Exception as e:
            self.log(f"⚠️ Lỗi zoom: {e}")


    # ===== BƯỚC 1: LOAD DXF =====
    def on_load_dxf(self):
        # Chọn nhiều file
        paths, _ = QFileDialog.getOpenFileNames(self, "Chọn DXF (nhiều file)", "", "DXF (*.dxf)")
        if not paths:
            return

        self.log(f"📂 Đang load {len(paths)} file(s)...")
        QApplication.processEvents()

        try:
            # Reset
            self.files = []
            all_levels_combined = {}

            # Load từng file
            for idx, path in enumerate(paths):
                self.log(f"   [{idx + 1}/{len(paths)}] {os.path.basename(path)}...")
                QApplication.processEvents()

                # [FIX]: Bỏ dòng flatten gây lỗi, load trực tiếp
                # [FIX]: Use recursive reader to support Blocks
                rows = read_all_entities_recursive(path)

                # Thu thập levels
                file_levels = collect_all_levels(rows)
                for lv, count in file_levels.items():
                    all_levels_combined[lv] = all_levels_combined.get(lv, 0) + count

                # Tạo file data structure
                file_data = create_file_data_structure(path)
                file_data["rows"] = rows
                file_data["status"] = "loaded"

                self.files.append(file_data)
                self.log(f"      ✓ {len(rows)} entities, Số tờ: {file_data['so_to']}")

            # Auto-init if not set
            if not self.selected_levels:
                self.selected_levels = {
                    "boundary": [10, 23, 31, 32],  # Mặc định: chỉ 10, 23, 31, 32
                    "so_thua": 13,
                    "dien_tich": 4, # Mặc định cũ
                    "ma_loai_dat": 2
                }
                self.boundary_levels = self.selected_levels["boundary"]
                self.ed_levels.setText(str(self.boundary_levels))
            
            # Apply to files
            for file_data in self.files:
                 file_data["selected_levels"] = self.selected_levels
            
            # Không hiện popup chọn level ngay lập tức nữa (Silent Mode)
            # Người dùng sẽ bấm nút "Chọn..." để cấu hình nếu muốn


            # Backward compatibility: set first file as current
            if self.files:
                self.dxf_path = self.files[0]["dxf_path"]
                self.rows = self.files[0]["rows"]

                # Hiển thị tên file
                if len(self.files) == 1:
                    self.ed_dxf.setText(os.path.basename(self.files[0]["dxf_path"]))
                else:
                    self.ed_dxf.setText(
                        f"{len(self.files)} files: " + ", ".join([f"Tờ {f['so_to']}" for f in self.files]))

            # Enable bước tiếp theo (Button gộp)
            self.btn_run_full.setEnabled(True)
            self.current_step = 1

            self.log(f"✅ Đã load {len(self.files)} file(s)")

        except Exception as e:
            self.log(f"❌ Lỗi: {e}")
            import traceback
            traceback.print_exc()
            QMessageBox.critical(self, "Lỗi", f"Không thể load DXF:\n{e}")

    # ===== UI ACTIONS =====
    def on_pick_levels(self):
        """Chọn level TOPO (Boundary)"""
        # Collect levels from loaded files
        all_levels_with_data = {}  # Levels có dữ liệu
        all_layers_in_dxf = set()  # TẤT CẢ layers trong DXF
        
        for f in self.files:
            try:
                # Đếm entities theo level
                counts = collect_all_levels(f["rows"])
                for lv, c in counts.items():
                    all_levels_with_data[lv] = all_levels_with_data.get(lv, 0) + c
                
                # Đọc TẤT CẢ layers từ DXF file (kể cả không có entity)
                dxf_path = f.get("dxf_path")
                if dxf_path and os.path.exists(dxf_path):
                    try:
                        import ezdxf
                        doc = ezdxf.readfile(dxf_path)
                        # Lấy tất cả layer names (kể cả tên text)
                        for layer in doc.layers:
                            layer_name = layer.dxf.name
                            # Thử chuyển thành số, nếu không được thì giữ nguyên tên text
                            try:
                                level_num = int(layer_name)
                                all_layers_in_dxf.add(level_num)
                            except:
                                # Layer name không phải số (ví dụ: "Boundary", "Text"...)
                                # Vẫn thêm vào để hiển thị
                                all_layers_in_dxf.add(layer_name)
                    except Exception as e:
                        pass
            except: 
                pass
        
        # [FIX] Đảm bảo LUÔN hiển thị các level phổ biến 0-63
        # Ngay cả khi DXF không có layer đó
        for i in range(64):  # 0 đến 63
            all_layers_in_dxf.add(i)
        
        # Tạo dialog với cả 2 thông tin: all layers và levels có dữ liệu
        # Truyền current_selection để dialog nhớ các level đã chọn
        dialog = LevelSelectorDialog(
            all_levels_with_data, 
            self, 
            all_layers=all_layers_in_dxf,
            current_selection=self.boundary_levels  # GHI NHỚ các level đã chọn
        )
        
        if dialog.exec_() == QDialog.Accepted:
            result = dialog.get_selected_levels()
            self.boundary_levels = result["boundary"]
            self.ed_levels.setText(str(self.boundary_levels))
            self.log(f"🔧 Update Topo Levels: {self.boundary_levels}")
            
            # Update sync
            if self.selected_levels:
                self.selected_levels["boundary"] = self.boundary_levels
                
    def on_config_labels(self):
        """Chọn level NHÃN (L13, L4, L2)"""
        # Collect levels với dữ liệu
        levels_with_data = set()
        for f in self.files:
            try:
                counts = collect_all_levels(f["rows"])
                levels_with_data.update(counts.keys())
            except: pass
        
        # Luôn hiển thị Level 0-63 (giống dialog Topo)
        all_levels = list(range(64))  # 0 đến 63
        
        current_cfg = self.selected_levels if self.selected_levels else {}
        
        # Truyền cả all_levels và levels_with_data để đánh dấu
        dialog = LabelConfigDialog(all_levels, current_cfg, self, levels_with_data=levels_with_data)
        if dialog.exec_() == QDialog.Accepted:
            new_cfg = dialog.get_config()
            
            if not self.selected_levels: self.selected_levels = {}
            self.selected_levels.update(new_cfg)
            
            # Update Log display
            st = new_cfg.get('so_thua')
            dt = new_cfg.get('dien_tich')
            ld = new_cfg.get('ma_loai_dat')
            self.ed_labels_cfg.setText(f"Số:{st} | DT:{dt} | Loại:{ld}")
            self.log(f"🔧 Update Label Config: ST={st}, DT={dt}, Loai={ld}")


    def on_run_topo(self):
        if not self.rows:
            return
        self.log("🔄 Đang chạy topo...")
        QApplication.processEvents()

        try:
            self.polys = build_topo_polygons_from_rows(
                self.rows, self.boundary_levels, snap_grid=0.001, min_area=0.01
            )

            if not self.polys:
                raise Exception("Không tạo được polygon nào")

            self.poly_info = [{
                "topo_area": p.area,
                "label_area": None,
                "label_src": "",
                "note": "",
                "so_thua": None,
                "ma_loai_dat": None,
            } for p in self.polys]

            self._update_table()
            self.btn_assign_basic.setEnabled(True)
            self.current_step = 2

            self.log(f"✅ Tạo được {len(self.polys)} polygon")

            # Cập nhật bản đồ
            self.update_map_view()

        except Exception as e:
            self.log(f"❌ Lỗi: {e}")
            if not self.is_batch_mode:
                QMessageBox.critical(self, "Lỗi", f"Không thể chạy topo:\n{e}")

    # ===== BƯỚC 3: GÁN THÔNG TIN CƠ BẢN (STRICT 3-CASE) =====
    def on_assign_basic(self):
        if not self.rows or not self.polys: return
        self.log("🔄 Đang gán L13, L2, L4 (Logic 3 Trường Hợp)...")
        from PyQt5.QtWidgets import QApplication
        QApplication.processEvents()

        try:
            # [FIX] Khởi tạo clusters để hàm on_assign_arrow có thể sử dụng
            self.clusters = build_label_clusters(self.rows, cluster_radius=5.0)
            self.log(f"   📊 Đã tạo {len(self.clusters)} clusters từ text L13, L2, L4")
            
            # Helper: Tính khoảng cách bình phương
            def dist_sq(p1, p2):
                return (p1[0]-p2[0])**2 + (p1[1]-p2[1])**2

            count_assigned = 0
            assigned_so_thua = set()  # Track text đã gán để tránh gán lại
            
            for pidx, poly in enumerate(self.polys):
                info = self.poly_info[pidx]
                topo_area = info.get("topo_area", 0)
                poly_center = poly.centroid
                
                # [PRIORITY] Kiểm tra: Nếu có DUY NHẤT 1 text L13 NẰM TRONG thửa → Gán luôn
                from shapely.geometry import Point
                import math
                l13_inside = []
                for row in collect_text_by_level(self.rows, 13):
                    x, y = row.get("x"), row.get("y")
                    if x is not None and y is not None:
                        pt = Point(x, y)
                        if poly.contains(pt):  # CHỈ lấy text THỰC SỰ nằm TRONG
                            text = str(row.get("text", "")).strip()
                            try:
                                text_clean = re.sub(r'\D', '', text)
                                if text_clean:
                                    so_thua = int(text_clean)
                                    # Kiểm tra: text này đã được gán chưa?
                                    if so_thua not in assigned_so_thua:
                                        l13_inside.append(so_thua)
                            except:
                                pass
                
                # [DEBUG] Log chi tiết
                if pidx < 50 and len(l13_inside) > 0:
                    self.log(f"   [DEBUG] Thửa STT {pidx+1}: Tìm thấy {len(l13_inside)} text L13 TRONG thửa: {l13_inside}")
                
                # Nếu có NHIỀU text → Chọn text tốt nhất
                if len(l13_inside) > 1:
                    if pidx < 50:
                        self.log(f"   ⚠️ [WARNING] Thửa STT {pidx+1}: Có {len(l13_inside)} text trong thửa - Chọn text tốt nhất")
                    
                    # Tìm cluster cho mỗi text
                    clusters = find_text_clusters_in_polygon(poly, self.rows)
                    
                    # Map text -> cluster
                    text_to_cluster = {}
                    for cluster in clusters:
                        if cluster['l13']:
                            so_thua = cluster['l13'][2]
                            if so_thua in l13_inside:
                                text_to_cluster[so_thua] = cluster
                    
                    # Chọn text tốt nhất
                    best_text = None
                    best_score = -1
                    best_dist = float('inf')
                    
                    for so_thua in l13_inside:
                        # Tính điểm dựa trên độ đầy đủ cluster
                        score = 0
                        if so_thua in text_to_cluster:
                            cluster = text_to_cluster[so_thua]
                            if cluster['completeness'] == 'full':
                                score = 3
                            elif cluster['completeness'] == 'partial':
                                score = 2
                            else:
                                score = 1
                            
                            # Tính khoảng cách đến tâm thửa
                            cx, cy = cluster['center']
                            dist = math.sqrt((cx - poly_center.x)**2 + (cy - poly_center.y)**2)
                        else:
                            # Không có cluster → điểm thấp
                            score = 0
                            dist = float('inf')
                        
                        # Chọn text có điểm cao nhất, nếu bằng nhau thì chọn gần tâm nhất
                        if score > best_score or (score == best_score and dist < best_dist):
                            best_score = score
                            best_dist = dist
                            best_text = so_thua
                    
                    # Gán text tốt nhất
                    if best_text and best_text not in assigned_so_thua:
                        info["so_thua"] = best_text
                        info["label_src"] = "L13-Multi-Best"
                        info["note"] = f"[L13-Multi] Chọn text tốt nhất trong {len(l13_inside)} text (score={best_score}, dist={best_dist:.1f}m)"
                        assigned_so_thua.add(best_text)
                        count_assigned += 1
                        self.log(f"   ✅ [L13-Multi] Thửa STT {pidx+1}: Chọn text {best_text} (score={best_score}, dist={best_dist:.1f}m)")
                        self.log(f"      → Đã đánh dấu text {best_text} là đã gán (total: {len(assigned_so_thua)} text)")
                        continue
                
                # Nếu có DUY NHẤT 1 text L13 trong thửa → Gán luôn, bỏ qua cluster
                elif len(l13_inside) == 1:
                    info["so_thua"] = l13_inside[0]
                    info["label_src"] = "L13-Inside"
                    info["note"] = f"[L13-Inside] Text duy nhất nằm trong thửa"
                    assigned_so_thua.add(l13_inside[0])  # Đánh dấu đã gán
                    count_assigned += 1
                    self.log(f"   ✅ [L13-Inside] Thửa STT {pidx+1}: Gán text {l13_inside[0]}")
                    continue  # Bỏ qua xử lý cluster
                
                clusters = find_text_clusters_in_polygon(poly, self.rows)
                
                # [DEBUG] Log cho thửa cụ thể
                if pidx < 20:  # Chỉ log 20 thửa đầu để tránh spam
                    if clusters:
                        self.log(f"   [DEBUG] Thửa STT {pidx+1}: Tìm thấy {len(clusters)} cluster(s)")
                        for idx, c in enumerate(clusters):
                            l13_val = c['l13'][2] if c['l13'] else None
                            l2_val = c['l2'][2] if c['l2'] else None
                            l4_val = c['l4'][2] if c['l4'] else None
                            self.log(f"      Cluster {idx+1}: L13={l13_val}, L2={l2_val}, L4={l4_val}, Type={c['completeness']}")
                
                if not clusters:
                    continue
                    
                # Phân loại cluster
                full_clusters = [c for c in clusters if c['completeness'] == 'full']
                partial_clusters = [c for c in clusters if c['completeness'] == 'partial'] # L13 + L4
                minimal_clusters = [c for c in clusters if c['completeness'] == 'minimal'] # L13 only / L13+L2
                
                # Biến lưu kết quả chọn
                chosen_cluster = None
                method_note = ""
                
                # === CASE 1: Duy nhất 1 cụm (Full hoặc L13 hoặc L13,4) ===
                if len(clusters) == 1:
                    if pidx < 10:
                        self.log(f"      ✓ CASE 1: Chỉ có 1 cluster duy nhất")
                    chosen_cluster = clusters[0]
                    method_note = "Case1-Single"
                    
                # === CASE 2: 1 Full + 1 Text lẻ (Partial/Minimal) ===
                # (User: "1 cụm đủ... và 1 text chỉ có 13 hoặc 13,4")
                elif len(full_clusters) == 1 and (len(partial_clusters) + len(minimal_clusters) >= 1):
                    # Ưu tiên Full trước
                    full_c = full_clusters[0]
                    
                    # Check Area Diff > 50m2?
                    diff_full = float('inf')
                    if full_c['l4']:
                        diff_full = abs(full_c['l4'][2] - topo_area)
                    
                    if diff_full <= 50.0:
                        # Full cluster khớp tốt -> Chọn luôn
                        chosen_cluster = full_c
                        method_note = f"Case2-FullPriority(diff={diff_full:.1f}m²)"
                    else:
                        # Full bị lệch > 50m2 -> Test Partial/Minimal
                        others = partial_clusters + minimal_clusters
                        
                        # Tìm Partial/Minimal có diện tích khớp nhất
                        best_other = None
                        best_other_diff = float('inf')
                        
                        for ot in others:
                            if ot['l4']:
                                d_val = abs(ot['l4'][2] - topo_area)
                                if d_val < best_other_diff:
                                    best_other_diff = d_val
                                    best_other = ot
                        
                        # So sánh: Partial tốt hơn Full không?
                        if best_other and best_other_diff < diff_full:
                            # Partial khớp hơn -> Chọn Partial
                            chosen_cluster = best_other
                            method_note = f"Case2-PartialBetter(diff={best_other_diff:.1f}m² vs Full={diff_full:.1f}m²)"
                        else:
                            # Full vẫn tốt hơn (hoặc không có Partial có diện tích)
                            chosen_cluster = full_c
                            method_note = f"Case2-FullLessBad(diff={diff_full:.1f}m²)"

                # === CASE 3: >= 2 Cụm Full ===
                # User: "gán text gần cạnh thửa nhất và gần tâm nhất có độ lệch ≤ 50m²"
                elif len(full_clusters) >= 2:
                    from shapely.geometry import Point
                    
                    # Tính khoảng cách đến cạnh và tâm cho mỗi cluster
                    for fc in full_clusters:
                        fc_pt = Point(fc['center'])
                        fc['dist_to_edge'] = poly.exterior.distance(fc_pt)
                        fc['dist_to_centroid'] = math.sqrt(dist_sq(fc['center'], (poly_center.x, poly_center.y)))
                        fc['area_diff'] = abs(fc['l4'][2] - topo_area) if fc['l4'] else float('inf')
                    
                    # Sắp xếp: Ưu tiên gần cạnh, sau đó gần tâm, cuối cùng là lệch diện tích ít
                    full_clusters.sort(key=lambda x: (x['dist_to_edge'], x['dist_to_centroid'], x['area_diff']))
                    
                    # Chọn cluster tốt nhất (không bắt buộc diff <= 50m²)
                    chosen_cluster = full_clusters[0]
                    diff = chosen_cluster['area_diff']
                    
                    if diff <= 50.0:
                        method_note = f"Case3-BestMatch(edge={chosen_cluster['dist_to_edge']:.1f}m, diff={diff:.1f}m²)"
                    else:
                        method_note = f"Case3-LeastBad(edge={chosen_cluster['dist_to_edge']:.1f}m, diff={diff:.1f}m²)"
                
                # === CASE DEFAULT (Các trường hợp còn lại) ===
                else:
                    # Ví dụ: Chỉ có 2 Partial, hoặc 2 Minimal, hoặc 0 Full...
                    # Logic chung: Ưu tiên có Diện tích khớp -> Gần tâm
                    
                    # Lọc những thằng có diện tích
                    has_area = [c for c in clusters if c['l4']]
                    if has_area:
                        # Sort theo Area Diff
                        has_area.sort(key=lambda x: abs(x['l4'][2] - topo_area))
                        # Lấy top 1
                        best = has_area[0]
                        # Nếu lệch <= 50 thì chốt
                        if abs(best['l4'][2] - topo_area) <= 50.0:
                            chosen_cluster = best
                            method_note = "Default-BestArea"
                        else:
                            # Nếu lệch quá, xem xét khoảng cách? 
                            # User ko nói rõ case này, tạm lấy Best Area
                            chosen_cluster = best
                            method_note = "Default-BestArea(LargeDiff)"
                    else:
                        # Ko có diện tích -> Lấy gần tâm nhất
                        clusters.sort(key=lambda x: dist_sq(x['center'], (poly_center.x, poly_center.y)))
                        chosen_cluster = clusters[0]
                        method_note = "Default-Nearestcenter"

                # === THỰC HIỆN GÁN ===
                if chosen_cluster:
                    so_thua_value = chosen_cluster['l13'][2]
                    
                    # Kiểm tra: text này đã được gán chưa?
                    if so_thua_value in assigned_so_thua:
                        if pidx < 20:
                            self.log(f"   [DEBUG] Thửa STT {pidx+1}: Bỏ qua - Text {so_thua_value} đã được gán")
                        continue
                    
                    info["so_thua"] = so_thua_value
                    assigned_so_thua.add(so_thua_value)  # Đánh dấu đã gán
                    
                    if chosen_cluster['l2']:
                         info["ma_loai_dat"] = chosen_cluster['l2'][2]
                         
                    if chosen_cluster['l4']:
                         info["label_area"] = chosen_cluster['l4'][2]
                         
                    info["label_src"] = method_note
                    info["note"] = f"[{method_note}] Gán từ cluster tại {chosen_cluster['center']}"
                    count_assigned += 1

            # === BỔ SUNG: Gán L13 đơn lẻ cho thửa chưa có thông tin ===
            self.log("   🔍 Đang kiểm tra các thửa chỉ có L13 đơn lẻ...")
            count_l13_only = 0
            
            from shapely.geometry import Point
            
            for pidx, poly in enumerate(self.polys):
                info = self.poly_info[pidx]
                
                # Bỏ qua nếu đã có số thửa
                if info.get("so_thua") is not None:
                    continue
                
                # Tìm text L13 trong polygon
                l13_in_poly = []
                for row in collect_text_by_level(self.rows, 13):
                    x, y = row.get("x"), row.get("y")
                    if x is not None and y is not None:
                        pt = Point(x, y)
                        if poly.contains(pt):
                            text = str(row.get("text", "")).strip()
                            try:
                                text_clean = re.sub(r'\D', '', text)
                                if text_clean:
                                    so_thua = int(text_clean)
                                    l13_in_poly.append(so_thua)
                            except:
                                pass
                
                # Nếu chỉ có 1 L13 → gán luôn (nhưng kiểm tra đã gán chưa)
                if len(l13_in_poly) == 1:
                    so_thua_candidate = l13_in_poly[0]
                    
                    # [FIX] Kiểm tra text đã được gán chưa
                    if so_thua_candidate not in assigned_so_thua:
                        info["so_thua"] = so_thua_candidate
                        info["label_src"] = "L13-Only"
                        info["note"] = "[L13 đơn lẻ] Gán số thửa từ text duy nhất trong polygon"
                        assigned_so_thua.add(so_thua_candidate)  # [FIX] Đánh dấu đã gán
                        count_l13_only += 1
                        count_assigned += 1
            
            if count_l13_only > 0:
                self.log(f"   ✅ Đã gán thêm {count_l13_only} thửa chỉ có L13 đơn lẻ")

            self.log(f"✅ Đã gán {count_assigned}/{len(self.polys)} thửa (bao gồm L13 đơn lẻ).")
            # Gán thêm thông tin từ bảng thửa nhỏ (format: BCS 3/101.9)
            assign_level4_inside(self.polys, self.rows, self.poly_info, tol_near=3.0)

            count_l13 = sum(1 for i in self.poly_info if i["so_thua"] is not None)
            count_l4 = sum(1 for i in self.poly_info if i["label_area"] is not None)

            self.log(f"✅ Đã gán: L13={count_l13}, L4={count_l4}")
            self._update_table()
            self.btn_assign_arrow.setEnabled(True)
            self.btn_check.setEnabled(True)
            self.current_step = 3
            self.update_map_view()

        except Exception as e:
            self.log(f"❌ Lỗi: {e}")
            import traceback
            traceback.print_exc()

    # ===== BƯỚC 4: GÁN MŨI TÊN (4 TRƯỜNG HỢP CỤ THỂ) =====
    def on_assign_arrow(self):
        if not self.rows or not self.polys: return
        self.log("🔄 Đang gán mũi tên (4 Trường Hợp Cụ Thể)...")
        from PyQt5.QtWidgets import QApplication
        QApplication.processEvents()

        try:
            from shapely.geometry import Point, LineString
            import math
            
            # === BƯỚC 0: Lọc các thửa chưa được gán ===
            unassigned_polys = []
            for pidx, (poly, info) in enumerate(zip(self.polys, self.poly_info)):
                if info.get("so_thua") is None:
                    unassigned_polys.append((pidx, poly, info))
            
            self.log(f"   📋 Tìm thấy {len(unassigned_polys)} thửa chưa được gán")
            
            if not unassigned_polys:
                self.log("   ✅ Tất cả thửa đã được gán!")
                self._update_table()
                self.btn_check.setEnabled(True)
                self.current_step = 4
                self.update_map_view()
                return
            
            # === BƯỚC 1: Xác định text/cluster chưa được gán ===
            # Tìm các số thửa đã được gán
            assigned_so_thua = set()
            for info in self.poly_info:
                st = info.get("so_thua")
                if st is not None:
                    assigned_so_thua.add(int(st))
            
            # Lọc cluster chưa được gán
            unused_clusters = []
            for cluster in self.clusters:
                st = cluster.get("so_thua")
                if st is not None and int(st) not in assigned_so_thua:
                    unused_clusters.append(cluster)
            
            # Lọc text L13 chưa được gán
            all_l13 = build_level13_points(self.rows)
            unused_l13_texts = []
            for x, y, so_thua, _ in all_l13:
                if int(so_thua) not in assigned_so_thua:
                    unused_l13_texts.append((x, y, so_thua))
            
            self.log(f"   📊 Cluster chưa gán: {len(unused_clusters)}, Text L13 chưa gán: {len(unused_l13_texts)}")
            
            # [DEBUG] Hiển thị text đã gán
            if len(assigned_so_thua) > 0:
                sorted_assigned = sorted(list(assigned_so_thua))
                self.log(f"   🔍 [DEBUG] Text đã gán ở Bước 3: {len(assigned_so_thua)} text")
                if len(sorted_assigned) <= 20:
                    self.log(f"      → {sorted_assigned}")
            
            # [DEBUG] Hiển thị chi tiết text L13 chưa gán
            if unused_l13_texts:
                self.log(f"   🔍 [DEBUG] Danh sách text L13 chưa gán:")
                for x, y, so_thua in unused_l13_texts[:10]:  # Chỉ hiển thị 10 text đầu
                    self.log(f"      - Thửa {so_thua} tại ({x:.1f}, {y:.1f})")
                
                # [DEBUG] Kiểm tra các text cụ thể
                debug_texts = ['248', '21', '65', '87', '109', '60', '201']
                found_debug = [st for _, _, st in unused_l13_texts if st in debug_texts]
                if found_debug:
                    self.log(f"   🔍 [DEBUG] Text quan tâm trong danh sách chưa gán: {', '.join(found_debug)}")
            
            # [DEBUG] Hiển thị thửa chưa gán và khoảng cách đến text gần nhất
            if unassigned_polys:
                self.log(f"   🔍 [DEBUG] Thửa chưa gán và text L13 gần nhất:")
                for pidx, poly, info in unassigned_polys[:5]:  # Chỉ hiển thị 5 thửa đầu
                    # Tìm text L13 gần nhất
                    min_dist = float('inf')
                    nearest_text = None
                    for x, y, so_thua in unused_l13_texts:
                        dist = poly.distance(Point(x, y))
                        if dist < min_dist:
                            min_dist = dist
                            nearest_text = so_thua
                    if nearest_text:
                        self.log(f"      - Thửa STT {pidx+1}: Text L13 gần nhất = {nearest_text} (cách {min_dist:.1f}m)")


            # === LOGIC GÁN THÔNG MINH: KIỂM TRA ĐIỀU KIỆN CHO TỪNG THỬA ===
            self.log("   🔍 Đang áp dụng logic gán thông minh (kiểm tra điều kiện)...")
            
            # Detect arrows một lần
            arrows = detect_arrows_from_rows(self.rows)
            self.log(f"   📊 Phát hiện {len(arrows)} mũi tên tiềm năng")
            
            # ===== TỐI ƯU: MAP ARROWS TO POLYGONS MỘT LẦN =====
            # Thay vì kiểm tra mọi arrow cho mọi polygon (O(n*m)),
            # ta map arrows to polygons trước (O(n+m))
            self.log(f"   🔄 Đang map mũi tên vào thửa...")
            arrow_to_polygon = {}  # {arrow_idx: polygon_idx}
            
            for arrow_idx, arrow in enumerate(arrows):
                target_pidx = find_polygon_at_arrow_head(arrow, self.polys, tolerance=5.0)
                if target_pidx is not None:
                    if target_pidx not in arrow_to_polygon:
                        arrow_to_polygon[target_pidx] = []
                    arrow_to_polygon[target_pidx].append(arrow_idx)
            
            self.log(f"   ✓ Đã map {len(arrow_to_polygon)} thửa có mũi tên chỉ vào")
            
            # Counters
            count_th4 = 0  # Mũi tên vector
            count_th5 = 0  # Nhiều thửa + 1 cụm
            count_th6 = 0  # Nhiều thửa + 1 L13
            count_th1 = 0  # 1 thửa + 1 cụm
            count_th2 = 0  # 1 thửa + nhiều cụm
            count_th3 = 0  # 1 thửa + 1 L13
            
            # Lọc cluster đầy đủ chưa dùng
            unused_full_clusters = [
                c for c in unused_clusters
                if c.get('so_thua') and c.get('ma_loai_dat') and c.get('dien_tich')
            ]
            
            # Xử lý TỪNG THỬA chưa gán
            for pidx, poly, info in list(unassigned_polys):
                if info.get("so_thua") is not None:
                    continue
                
                topo_area = info.get("topo_area", 0)
                
                
                # ========== BƯỚC 1: KIỂM TRA MŨI TÊN (TH4) - OPTIMIZED ==========
                # Sử dụng pre-mapped arrows thay vì loop qua tất cả arrows
                has_arrow = False
                
                # Kiểm tra xem có mũi tên nào chỉ vào thửa này không
                if pidx in arrow_to_polygon:
                    arrow_indices = arrow_to_polygon[pidx]
                    
                    # [DEBUG] Log
                    if pidx < 5:
                        self.log(f"      [TH4-CHECK] Thửa {pidx+1}: Có {len(arrow_indices)} mũi tên chỉ vào")
                    
                    # Xử lý từng mũi tên chỉ vào thửa này
                    for arrow_idx in arrow_indices:
                        arrow = arrows[arrow_idx]
                        tail_x, tail_y = arrow['start']
                        head_x, head_y = arrow['end']
                        arrow_length = arrow['length']
                        
                        # Vector của mũi tên (từ head đến tail ngươc hướng mũi tên)
                        # Dóng theo đường thẳng thì ta ưu tiên điểm nằm trên tia từ head qua tail
                        vx = tail_x - head_x
                        vy = tail_y - head_y
                        v_len = math.hypot(vx, vy)
                        if v_len > 0:
                            vx /= v_len
                            vy /= v_len
                            
                        # Tìm text chưa được gán
                        texts_near_tail = []
                        for x, y, so_thua in unused_l13_texts:
                            if int(so_thua) in assigned_so_thua:
                                continue
                            
                            dist_to_tail = math.sqrt((x - tail_x)**2 + (y - tail_y)**2)
                            if dist_to_tail < 30.0:  # Mở rộng lên 30m
                                # Tính khoảng cách từ point đến đường thẳng (dóng theo mũi tên)
                                # Công thức: |(x - tail_x)*vy - (y - tail_y)*vx|
                                dist_to_line = abs((x - tail_x) * vy - (y - tail_y) * vx)
                                # Vector từ tail đến text
                                dtx = x - tail_x
                                dty = y - tail_y
                                # Khoảng cách chiếu lên phương mũi tên (phải cùng chiều với hướng tail-to-text hoặc gần như vậy)
                                proj = dtx * vx + dty * vy
                                score = dist_to_line * 2 + dist_to_tail # Phạt nặng nếu lệch khỏi đường thẳng
                                texts_near_tail.append((x, y, so_thua, dist_to_tail, score, proj))
                        
                        # Nếu KHÔNG CÓ text gần đuôi → bỏ qua mũi tên này
                        if len(texts_near_tail) == 0:
                            if pidx < 10:
                                self.log(f"         Mũi tên {arrow_idx+1}: Không có text nào gần đuôi (< 30m)")
                            continue
                        
                        # TH4: Nhóm text sát nhau -> Dựa vào đường dóng mũi tên để chọn
                        # Sắp xếp theo score (gần đường thẳng nhất + gần đuôi nhất)
                        best_text = min(texts_near_tail, key=lambda t: t[4])
                        x, y, so_thua, dist_to_tail, score, proj = best_text
                        dist_to_poly = poly.distance(Point(x, y))
                        
                        info["so_thua"] = so_thua
                        info["label_src"] = "Arrow-TH4"
                        info["note"] = f"[TH4-Mũi tên dóng] Text gần đuôi dóng thẳng: {so_thua} (cách đuôi {dist_to_tail:.1f}m)"
                        assigned_so_thua.add(int(so_thua))
                        count_th4 += 1
                        has_arrow = True
                        
                        self.log(f"      ✅ [TH4] Thửa {pidx+1}: Gán theo mũi tên (dóng tuyến) → Thửa {so_thua} (cách đuôi {dist_to_tail:.1f}m)")
                        break  # Đã gán, không cần xử lý mũi tên khác
                
                if has_arrow:
                    continue  # Đã gán, bỏ qua thửa này


                
                # ========== BƯỚC 2: KIỂM TRA CỤM TEXT ĐẦY ĐỦ (L13,2,4) ==========
                # Tìm tất cả cụm gần thửa này (< 50m)
                nearby_clusters = []
                for cluster in unused_full_clusters:
                    if int(cluster.get('so_thua')) in assigned_so_thua:
                        continue
                    
                    cx = cluster.get('cx') or cluster.get('center_x')
                    cy = cluster.get('cy') or cluster.get('center_y')
                    dist = poly.distance(Point(cx, cy))
                    
                    if dist < 50.0:
                        nearby_clusters.append((cluster, dist))
                
                # TH2: Nếu có >= 2 cụm gần → Chọn cụm khớp diện tích nhất
                if len(nearby_clusters) >= 2:
                    nearby_clusters.sort(key=lambda x: abs(x[0].get('dien_tich', 0) - topo_area))
                    best_cluster, best_dist = nearby_clusters[0]
                    
                    info["so_thua"] = best_cluster['so_thua']
                    if best_cluster.get('ma_loai_dat'):
                        info["ma_loai_dat"] = best_cluster['ma_loai_dat']
                    if best_cluster.get('dien_tich'):
                        info["label_area"] = best_cluster['dien_tich']
                        area_diff = abs(best_cluster['dien_tich'] - topo_area)
                        info["note"] = f"[TH2-Nhiều cụm] Lệch DT {area_diff:.1f}m², cách {best_dist:.1f}m"
                    info["label_src"] = "Arrow-TH2"
                    assigned_so_thua.add(int(best_cluster['so_thua']))
                    count_th2 += 1
                    continue
                
                # TH1 hoặc TH5: Nếu có đúng 1 cụm gần
                elif len(nearby_clusters) == 1:
                    cluster, dist = nearby_clusters[0]
                    cluster_pt = Point(cluster.get('cx') or cluster.get('center_x'),
                                     cluster.get('cy') or cluster.get('center_y'))
                    
                    # Kiểm tra: Có bao nhiêu thửa khác cũng gần cụm này?
                    other_polys_near_cluster = []
                    for other_pidx, other_poly, other_info in unassigned_polys:
                        if other_pidx == pidx or other_info.get("so_thua") is not None:
                            continue
                        
                        other_dist = other_poly.distance(cluster_pt)
                        if other_dist < 50.0:
                            other_polys_near_cluster.append((other_pidx, other_poly, other_info, other_dist))
                    
                    # TH5: Nếu >= 2 thửa (bao gồm thửa hiện tại) gần cùng 1 cụm
                    if len(other_polys_near_cluster) >= 1:  # >= 1 thửa khác + thửa hiện tại = >= 2 thửa
                        # So sánh diện tích, chọn thửa lệch ít nhất
                        all_candidates = [(pidx, poly, info, dist, topo_area)] + \
                                       [(p, po, pi, d, pi.get("topo_area", 0)) 
                                        for p, po, pi, d in other_polys_near_cluster]
                        
                        cluster_area = cluster.get('dien_tich') or cluster.get('area')
                        all_candidates.sort(key=lambda x: abs(cluster_area - x[4]))
                        
                        best_pidx, best_poly, best_info, best_dist, best_topo = all_candidates[0]
                        
                        # Chỉ gán nếu thửa hiện tại là thửa tốt nhất
                        if best_pidx == pidx:
                            info["so_thua"] = cluster['so_thua']
                            if cluster.get('ma_loai_dat'):
                                info["ma_loai_dat"] = cluster['ma_loai_dat']
                            if cluster_area:
                                info["label_area"] = cluster_area
                                area_diff = abs(cluster_area - topo_area)
                                info["note"] = f"[TH5-Nhiều thửa 1 cụm] Lệch DT {area_diff:.1f}m², cách {dist:.1f}m"
                            info["label_src"] = "Arrow-TH5"
                            assigned_so_thua.add(int(cluster['so_thua']))
                            count_th5 += 1
                        # Nếu không phải thửa tốt nhất, bỏ qua (thửa khác sẽ được gán)
                        continue
                    
                    # TH1: Chỉ 1 thửa (thửa hiện tại) gần cụm → Gán trực tiếp
                    else:
                        info["so_thua"] = cluster['so_thua']
                        if cluster.get('ma_loai_dat'):
                            info["ma_loai_dat"] = cluster['ma_loai_dat']
                        if cluster.get('dien_tich'):
                            info["label_area"] = cluster['dien_tich']
                        info["label_src"] = "Arrow-TH1"
                        info["note"] = f"[TH1-1 thửa 1 cụm] Cách {dist:.1f}m"
                        assigned_so_thua.add(int(cluster['so_thua']))
                        count_th1 += 1
                        continue
                
                # ========== BƯỚC 3: KIỂM TRA TEXT L13 ĐƠN LẺ ==========
                # Tìm tất cả text L13 gần thửa này (< 50m)
                nearby_l13 = []
                for x, y, so_thua in unused_l13_texts:
                    if int(so_thua) in assigned_so_thua:
                        continue
                    
                    dist = poly.distance(Point(x, y))
                    if dist < 50.0:
                        nearby_l13.append((x, y, so_thua, dist))
                
                # TH3 hoặc TH6: Nếu có đúng 1 text L13 gần
                if len(nearby_l13) == 1:
                    x13, y13, so_thua, dist = nearby_l13[0]
                    l13_pt = Point(x13, y13)
                    
                    # Kiểm tra: Có bao nhiêu thửa khác cũng gần L13 này?
                    other_polys_near_l13 = []
                    for other_pidx, other_poly, other_info in unassigned_polys:
                        if other_pidx == pidx or other_info.get("so_thua") is not None:
                            continue
                        
                        other_dist = other_poly.distance(l13_pt)
                        if other_dist < 50.0:
                            other_polys_near_l13.append((other_pidx, other_poly, other_info, other_dist))
                    
                    # TH6: Nếu >= 2 thửa gần cùng 1 L13
                    if len(other_polys_near_l13) >= 1:
                        # Tìm diện tích từ clusters
                        l13_area = None
                        for cluster in self.clusters:
                            if cluster.get('so_thua') == so_thua:
                                l13_area = cluster.get('dien_tich') or cluster.get('area')
                                break
                        
                        if l13_area:
                            # So sánh diện tích
                            all_candidates = [(pidx, poly, info, dist, topo_area)] + \
                                           [(p, po, pi, d, pi.get("topo_area", 0)) 
                                            for p, po, pi, d in other_polys_near_l13]
                            
                            all_candidates.sort(key=lambda x: abs(l13_area - x[4]))
                            best_pidx, best_poly, best_info, best_dist, best_topo = all_candidates[0]
                            
                            # Chỉ gán nếu thửa hiện tại là thửa tốt nhất
                            if best_pidx == pidx:
                                info["so_thua"] = so_thua
                                # [FIX] Chỉ gán L13, không gán label_area (để Bước 5 xử lý)
                                info["label_src"] = "Arrow-TH6"
                                info["note"] = f"[TH6-Nhiều thửa 1 L13] Chỉ gán số thửa"
                                assigned_so_thua.add(int(so_thua))
                                count_th6 += 1
                            continue
                    
                    # TH3: Chỉ 1 thửa gần L13 → Gán trực tiếp
                    else:
                        info["so_thua"] = so_thua
                        # [FIX] Chỉ gán L13, không gán label_area (để Bước 5 xử lý)
                        info["label_src"] = "Arrow-TH3"
                        info["note"] = f"[TH3-1 thửa 1 L13] Chỉ gán số thửa, cách {dist:.1f}m"
                        assigned_so_thua.add(int(so_thua))
                        count_th3 += 1
                        continue
            
            # === KẾT THÚC ===
            self.log(f"   ✅ [TH4-Mũi tên] {count_th4} thửa")
            self.log(f"   ✅ [TH5-Nhiều thửa 1 cụm] {count_th5} thửa")
            self.log(f"   ✅ [TH6-Nhiều thửa 1 L13] {count_th6} thửa")
            self.log(f"   ✅ [TH1-1 thửa 1 cụm] {count_th1} thửa")
            self.log(f"   ✅ [TH2-1 thửa nhiều cụm] {count_th2} thửa")
            self.log(f"   ✅ [TH3-1 thửa 1 L13] {count_th3} thửa")            
            # ========== BƯỚC CUỐI: GÁN TEXT GẦN NHẤT CHO CÁC THỬA CÒN LẠI ==========
            # VÒNG 1: Gán text trong 10m
            self.log(f"   🔍 [Vòng 1] Đang gán text gần nhất (< 10m)...")
            count_nearest_10m = 0
            
            for pidx, info in enumerate(self.poly_info):
                if info.get("so_thua") is not None:
                    continue  # Đã có số thửa rồi
                
                poly = self.polys[pidx]
                
                # Tìm text L13 chưa gán gần thửa nhất (TRONG 10m)
                best_text = None
                best_dist = float('inf')
                
                for x, y, so_thua in unused_l13_texts:
                    if int(so_thua) in assigned_so_thua:
                        continue
                    
                    dist = poly.distance(Point(x, y))
                    if dist < 10.0 and dist < best_dist:
                        best_dist = dist
                        best_text = (x, y, so_thua)
                
                # Nếu tìm thấy text trong 10m → Gán luôn
                if best_text:
                    x, y, so_thua = best_text
                    info["so_thua"] = so_thua
                    info["label_src"] = "Nearest-10m"
                    info["note"] = f"[Fallback-10m] Text gần nhất: {so_thua} (cách {best_dist:.1f}m)"
                    assigned_so_thua.add(int(so_thua))
                    count_nearest_10m += 1
            
            if count_nearest_10m > 0:
                self.log(f"   ✅ [Fallback-10m] {count_nearest_10m} thửa")
            
            # VÒNG 2: Gán text trong 20m (cho những thửa vẫn chưa gán)
            self.log(f"   🔍 [Vòng 2] Đang gán text gần nhất (< 20m) cho thửa còn lại...")
            count_nearest_20m = 0
            
            for pidx, info in enumerate(self.poly_info):
                if info.get("so_thua") is not None:
                    continue  # Đã có số thửa rồi
                
                poly = self.polys[pidx]
                
                # Tìm text L13 chưa gán gần thửa nhất (TRONG 20m)
                best_text = None
                best_dist = float('inf')
                
                for x, y, so_thua in unused_l13_texts:
                    if int(so_thua) in assigned_so_thua:
                        continue
                    
                    dist = poly.distance(Point(x, y))
                    if dist < 20.0 and dist < best_dist:
                        best_dist = dist
                        best_text = (x, y, so_thua)
                
                # Nếu tìm thấy text trong 20m → Gán luôn
                if best_text:
                    x, y, so_thua = best_text
                    info["so_thua"] = so_thua
                    info["label_src"] = "Nearest-20m"
                    info["note"] = f"[Fallback-20m] Text gần nhất: {so_thua} (cách {best_dist:.1f}m)"
                    assigned_so_thua.add(int(so_thua))
                    count_nearest_20m += 1
            
            if count_nearest_20m > 0:
                self.log(f"   ✅ [Fallback-20m] {count_nearest_20m} thửa")
            
            count_nearest = count_nearest_10m + count_nearest_20m
            
            # Cập nhật tổng số
            total_assigned = count_th4 + count_th5 + count_th6 + count_th1 + count_th2 + count_th3 + count_nearest
            self.log(f"✅ Tổng cộng đã gán {total_assigned} thửa qua logic thông minh")
            
            self._update_table()
            self.btn_check.setEnabled(True)
            self.current_step = 4
            self.update_map_view()

        except Exception as e:
            self.log(f"❌ Lỗi: {e}")
            import traceback
            traceback.print_exc()


    def auto_correct_swap_logic(self):
        """
        Logic tự động sửa lỗi hoán đổi số thửa
        """
        pass


    def auto_correct_swap_logic(self):
        """
        Logic tự động sửa lỗi hoán đổi số thửa
        """
        pass



    # ===== BƯỚC 5: KIỂM TRA =====
    def on_check(self):
        if not self.rows or not self.polys: return
        self.log("🔄 Đang kiểm tra...")
        from PyQt5.QtWidgets import QApplication
        QApplication.processEvents()

        try:
            # Kiểm tra sự chênh lệch diện tích
            errors = []
            for idx, info in enumerate(self.poly_info):
                topo_area = info.get("topo_area", 0)
                label_area = info.get("label_area")
                if label_area is not None and topo_area > 0:
                    diff = abs(topo_area - label_area)
                    diff_pct = (diff / topo_area) * 100
                    if diff_pct > 10:  # Lỗi nếu lệch > 10%
                        errors.append((idx, info.get("so_thua"), diff, diff_pct))
            
            self.log(f"✅ Kiểm tra hoàn tất: {len(errors)} thửa có lệch diện tích > 10%")
            
            self._update_table()
            self.btn_check.setEnabled(True) # btn_export removed/renamed? Usually btn_check enables next step
            self.current_step = 5
            
            # Cập nhật bản đồ  
            self.update_map_view()
            
        except Exception as e:
            self.log(f"❌ Lỗi: {e}")
            import traceback
            traceback.print_exc()

    def on_export(self):
        """Export data to Excel"""
        if not self.polys:
            self.log("⚠️ Chưa có dữ liệu để export")
            return
        
        from PyQt5.QtWidgets import QFileDialog
        import pandas as pd
        from collections import defaultdict
        
        # Chọn file để lưu
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Lưu kết quả",
            "",
            "Excel Files (*.xlsx)"
        )
        
        if not file_path:
            return
        
        try:
            self.log("🔄 Đang export dữ liệu...")
            
            # Chuẩn bị dữ liệu chính
            data = []
            for pidx, poly in enumerate(self.polys):
                info = self.poly_info[pidx]
                data.append({
                    'STT': pidx + 1,
                    'Số thửa': info.get('so_thua', ''),
                    'Loại đất': info.get('ma_loai_dat', ''),
                    'DT Topo (m²)': round(info.get('topo_area', 0), 2),
                    'DT Nhãn (m²)': round(info.get('label_area', 0), 2) if info.get('label_area') else '',
                    'Chênh lệch (m²)': round(abs(info.get('topo_area', 0) - info.get('label_area', 0)), 2) if info.get('label_area') else '',
                    'Nguồn': info.get('label_src', ''),
                    'Ghi chú': info.get('note', '')
                })
            
            df_main = pd.DataFrame(data)
            
            # Tìm thửa trùng số
            so_thua_count = defaultdict(list)
            for pidx, poly in enumerate(self.polys):
                info = self.poly_info[pidx]
                so_thua = info.get('so_thua')
                if so_thua:
                    so_thua_count[so_thua].append({
                        'STT': pidx + 1,
                        'Số thửa': so_thua,
                        'Loại đất': info.get('ma_loai_dat', ''),
                        'DT Topo (m²)': round(info.get('topo_area', 0), 2),
                        'DT Nhãn (m²)': round(info.get('label_area', 0), 2) if info.get('label_area') else '',
                        'Nguồn': info.get('label_src', ''),
                        'Ghi chú': info.get('note', '')
                    })
            
            # Lọc chỉ lấy thửa trùng (>= 2 thửa cùng số)
            duplicates = []
            for so_thua, items in so_thua_count.items():
                if len(items) >= 2:
                    for item in items:
                        duplicates.append(item)
            
            # Xuất Excel
            with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
                df_main.to_excel(writer, sheet_name='Kết quả', index=False)
                
                if duplicates:
                    df_dup = pd.DataFrame(duplicates)
                    df_dup = df_dup.sort_values('Số thửa')
                    df_dup.to_excel(writer, sheet_name='Thửa trùng số', index=False)
                    self.log(f"   ⚠️ Tìm thấy {len(duplicates)} thửa có số trùng nhau")
            
            self.log(f"✅ Đã export thành công: {file_path}")
            if duplicates:
                self.log(f"   📊 Sheet 'Thửa trùng số': {len(duplicates)} dòng")
            
        except Exception as e:
            self.log(f"❌ Lỗi export: {e}")
            import traceback
            traceback.print_exc()

    def on_assign_small_v2(self):
        if not self.rows or not self.polys: return
        self.log("🔄 Đang thống kê text ngoài & Gán bổ sung (Logic mới)...")
        from PyQt5.QtWidgets import QApplication
        QApplication.processEvents()

        try:
            min_distance = 30.0
            
            l13_all = build_level13_points(self.rows)
            l4_all = build_level4_points(self.rows)
            
            # --- [NEW STRICT LOGIC] Map Points to Polygons ---
            self.log("   🔒 Đang kiểm tra vị trí không gian của nhãn (Point-in-Polygon)...")
            
            # Helper to map point index -> poly index
            temp_l13_poly = {} # index -> poly_idx
            temp_l4_poly = {}  # index -> poly_idx
            
            def get_containing_poly(x, y, polys):
                pt = Point(x, y)
                for i, p in enumerate(polys):
                     if p.contains(pt):
                         return i
                return None

            # Map L13
            for i, (x, y, s, _) in enumerate(l13_all):
                pid = get_containing_poly(x, y, self.polys)
                if pid is not None: temp_l13_poly[i] = pid
                
            # Map L4
            for i, (x, y, a, _) in enumerate(l4_all):
                pid = get_containing_poly(x, y, self.polys)
                if pid is not None: temp_l4_poly[i] = pid

            self.log(f"      -> Đã map {len(temp_l13_poly)} số thửa và {len(temp_l4_poly)} diện tích vào các thửa.")

            # Tạo dictionary : {so_thua: dien_tich}
            global_lookup = {}
            used_l4_coords = set() 
            
            # Strict pairing loop using Global Sorting (Best Fit First)
            candidates = []
            
            for i, (x13, y13, st, _) in enumerate(l13_all):
                pid_13 = temp_l13_poly.get(i)
                
                # Duyệt tất cả L4
                for j, (x4, y4, area, _) in enumerate(l4_all):
                    pid_4 = temp_l4_poly.get(j)
                    
                    # --- RULE 1: SAME POLYGON CONSTRAINT ---
                    is_same_poly = False
                    if pid_13 is not None:
                        # Nếu L13 trong Poly A, thì L4 PHẢI trong Poly A
                        if pid_4 != pid_13: continue
                        is_same_poly = True
                    else:
                        # Nếu L13 nằm ngoài, KHÔNG ĐƯỢC lấy L4 đang nằm gọn trong Poly nào đó
                        if pid_4 is not None: continue
                    
                    # Tính khoảng cách
                    d = ((x4-x13)**2 + (y4-y13)**2)**0.5
                    
                    # Limit check
                    limit = min_distance
                    if is_same_poly: limit = 500.0 # Nới lỏng nếu cùng thửa
                    
                    if d < limit:
                        candidates.append((d, i, j, area, st))
            
            # Sắp xếp theo khoảng cách tăng dần (Ưu tiên cặp gần nhất)
            candidates.sort(key=lambda x: x[0])
            
            used_l13_indices = set()
            used_l4_coords = set() # Re-used variable name
            
            for dist, i, j, area, st in candidates:
                # Nếu Số thửa đã có cặp OR Diện tích đã bị lấy -> Bỏ qua
                if i in used_l13_indices: continue
                if j in used_l4_coords: continue
                
                # Chốt đơn
                global_lookup[st] = area
                
                used_l13_indices.add(i)
                used_l4_coords.add(j)
            
            self.log(f"   📊 Xây dựng dữ liệu: {len(global_lookup)} cặp Số thửa-Diện tích (Strict Mode)")


            # --- 1.5. ƯU TIÊN SỬA LỖI TRƯỚC (Lần 1 - Trước khi Fill) ---
            self.log("\n=== 🟢 PASS 1: START PRE-VALIDATION ===")
            self.auto_correct_swap_logic()
            self.refine_assignment_by_neighbors()
            self.log("=== 🟢 PASS 1: COMPLETED ===\n")

            # --- 2. Gán bổ sung theo ID (QUAN TRỌNG: User yêu cầu) ---
            # Duyệt các thửa đã có Số nhưng thiếu Diện tích
            assigned_by_id = 0
            for info in self.poly_info:
                st = info.get("so_thua")
                lbl_area = info.get("label_area")
                
                if st is not None and lbl_area is None:
                    # Tra cứu
                    if st in global_lookup:
                        info["label_area"] = global_lookup[st]
                        info["label_src"] = "Step5-LookupID"
                        info["note"] = f"[Gán bổ sung] Tìm thấy diện tích {global_lookup[st]}m² từ text ID {st}"
                        assigned_by_id += 1

            self.log(f"✅ Gán bổ sung theo ID: {assigned_by_id} thửa")
            if assigned_by_id > 0:
                self._update_table()

            # --- 2.5. ƯU TIÊN SỬA LỖI LẦN 2 (Lần 2 - Sau khi Fill) ---
            # Logic: Sau khi điền thêm dữ liệu, có thể phát sinh các ca 'mới đủ điều kiện' để phát hiện sai
            self.log("\n=== 🔵 PASS 2: FINAL VALIDATION CHECK === (Chạy lại để vét lỗi)")
            self.auto_correct_swap_logic()
            self.refine_assignment_by_neighbors()
            self.log("=== 🔵 PASS 2: COMPLETED ===\n")

            # --- 3. Thống kê text "thực sự" nằm ngoài (chưa gán cho ai) ---
            # Chỉ mang tính chất báo cáo
            
            # Lọc text L13 xa polygon để báo cáo
            remote_l13 = []
            for (x, y, s, row_obj) in l13_all:
                pt = Point(x, y)
                min_dist = min([pt.distance(p) for p in self.polys] if self.polys else [999999])
                if min_dist >= min_distance:
                     # Kiểm tra xem số thửa này đã được gán vào polygon nào chưa
                     is_assigned = False
                     for info in self.poly_info:
                         if info.get("so_thua") == s:
                             is_assigned = True
                             break
                     
                     if not is_assigned:
                        remote_l13.append({
                            "text": s,
                            "x": x, "y": y, "distance": min_dist
                        })

            if remote_l13:
                 self.log(f"   ⚠️ Còn {len(remote_l13)} text Số thửa nằm xa >=30m chưa được gán:")
                 # Tìm L4 kèm theo để hiển thị
                 report_data = []
                 for item in remote_l13:
                     st = item["text"]
                     area = global_lookup.get(st, "")
                     report_data.append({"Số thửa": st, "Diện tích": area, "Cách": f"{item['distance']:.1f}"})
                 
            else:
                self.log("   ✅ Tất cả text số thửa xa đã được xử lý hoặc gán hết.")


            # Chỉ hiển thị thông báo nếu KHÔNG phải batch mode
            if not self.is_batch_mode:
                from PyQt5.QtWidgets import QMessageBox
                QMessageBox.information(self, "Hoàn thành Step 5", 
                    f"Đã gán bổ sung được {assigned_by_id} thửa mới.\n"
                    f"Đã chạy 2 vòng kiểm tra Hoán đổi & Hàng xóm.\n"
                    f"Kết quả cuối cùng đã được cập nhật!")

        except Exception as e:
             self.log(f"❌ Lỗi Step 5: {e}")
             import traceback
             self.log(traceback.format_exc())
             if not self.is_batch_mode:
                 from PyQt5.QtWidgets import QMessageBox
                 QMessageBox.critical(self, "Lỗi", f"Không thể thống kê:\n{e}")

    def auto_correct_swap_logic(self):
        """
        Logic tự động hoán đổi (Swap) các thửa bị gán nhầm chéo.
        """
        self.log("🔄 [Auto-Swap] ĐANG TẮT TẠM THỜI ĐỂ TEST")
        return  # TẮT TẠM THỜI
        
        # self.log("🔄 [Auto-Swap] Đang kiểm tra lỗi gán chéo...")
        # failed_indices = []
        # for idx, info in enumerate(self.poly_info):
        #      topo = info.get("topo_area", 0)
        #      label = info.get("label_area")
        #      
        #      # Chỉ xét lỗi nếu diện tích lệch > 0.5
        #      if label and abs(topo - label) > 0.5:
        #          failed_indices.append(idx)
        # 
        # swapped_count = 0
        # processed_indices = set()
        # 
        # for i in range(len(failed_indices)):
        #     idx1 = failed_indices[i]
        #     if idx1 in processed_indices: continue
        #     
        #     info1 = self.poly_info[idx1]
        #     
        #     # [CRITICAL] Nếu số thửa 1 NẰM TRONG thửa (Step2-Basic), KHÔNG ĐƯỢC CHUYỂN SỐ THỬA ĐI NƠI KHÁC
        #     src1 = str(info1.get("label_src", ""))
        #     if src1.startswith("Step2") or src1.startswith("Case"): 
        #         continue
        # 
        #     topo1 = info1.get("topo_area", 0)
        #     label1 = info1.get("label_area", 0)
        #     
        #     # Tìm cặp hoán đổi
        #     for j in range(i + 1, len(failed_indices)):
        #         idx2 = failed_indices[j]
        #         if idx2 in processed_indices: continue
        #         
        #         info2 = self.poly_info[idx2]
        #         src2 = str(info2.get("label_src", ""))
        #         if src2.startswith("Step2") or src2.startswith("Case"): 
        #             continue # Locked
        #         
        #         topo2 = info2.get("topo_area", 0)
        #         label2 = info2.get("label_area", 0)
        #         
        #         match_cross_1 = abs(topo1 - label2) <= 0.5
        #         match_cross_2 = abs(topo2 - label1) <= 0.5
        #         
        #         if match_cross_1 and match_cross_2:
        #             temp_sothua = info1.get("so_thua")
        #             temp_maloai = info1.get("ma_loai_dat")
        #             temp_label = info1.get("label_area")
        #             
        #             # Gán 2 -> 1
        #             info1["so_thua"] = info2.get("so_thua")
        #             info1["ma_loai_dat"] = info2.get("ma_loai_dat")
        #             info1["label_area"] = info2.get("label_area")
        #             info1["label_src"] = "Auto-Swap"
        #             info1["note"] = f"[Auto-Swap] Đổi với thửa STT {idx2+1} (sai cũ: {temp_sothua})"
        #             
        #             # Gán 1 -> 2
        #             info2["so_thua"] = temp_sothua
        #             info2["ma_loai_dat"] = temp_maloai
        #             info2["label_area"] = temp_label
        #             info2["label_src"] = "Auto-Swap"
        #             info2["note"] = f"[Auto-Swap] Đổi với thửa STT {idx1+1} (sai cũ: {info2.get('so_thua')})"
        #             
        #             swapped_count += 1
        #             processed_indices.add(idx1)
        #             processed_indices.add(idx2)
        #             
        #             self.log(f"   ✅ Auto-Swap: STT {idx1+1} <--> STT {idx2+1}")
        #             break
        # 
        # if swapped_count > 0:
        #     self.log(f"   => Đã sửa {swapped_count} cặp gán chéo.")
        
        self._update_table()
        return 0  # swapped_count = 0 vì đã tắt

    def refine_assignment_by_neighbors(self, deviation_threshold=1.0):
        """
        Rà soát lại toàn bộ các gán ghép.
        """
        self.log("🔄 [Neighborhood] RÀ SOÁT LẠI (Neighborhood Review)...")
        swap_count = 0
        move_count = 0
        
        # 1. Lấy danh sách các thửa đã gán
        assigned_indices = []
        for idx, info in enumerate(self.poly_info):
            if info.get("so_thua") is not None and info.get("label_area") is not None:
                assigned_indices.append(idx)
                
        if not assigned_indices: return

        # 2. Duyệt qua từng thửa đã gán
        for idx1 in assigned_indices:
            info1 = self.poly_info[idx1]
            src1 = str(info1.get("label_src", ""))
            if src1.startswith("Step2") or src1.startswith("Case"): 
                continue
                
            poly1 = self.polys[idx1]
            st1 = info1.get("so_thua")
            lbl_area1 = info1.get("label_area")
            topo1 = info1.get("topo_area", 0)
            
            diff1 = abs(topo1 - lbl_area1)
            
            if diff1 < 0.5: 
                continue 

            # Tìm hàng xóm
            best_neighbor_idx = None
            min_diff_neighbor = float('inf')
            
            possible_neighbors = []
            for idx2, poly2 in enumerate(self.polys):
                if idx1 == idx2: continue
                if not poly1.envelope.intersects(poly2.envelope): continue
                if poly1.distance(poly2) < 0.2:
                    possible_neighbors.append(idx2)
            
            for idx2 in possible_neighbors:
                info2 = self.poly_info[idx2]
                src2 = str(info2.get("label_src", ""))
                if src2.startswith("Step2") or src2.startswith("Case"): 
                    pass
                else:
                    pass

                topo2 = info2.get("topo_area", 0)
                diff_if_move = abs(topo2 - lbl_area1)
                
                if diff_if_move < 0.5 and diff_if_move < diff1:
                    # Case A: Nhà hàng xóm (P2) đang trống -> MOVE luôn
                    if info2.get("so_thua") is None:
                        self.log(f"   🛠️ MOVE: Thửa {st1} (DT={lbl_area1}) đang ở P{idx1} (Topo={topo1}) -> P{idx2}")
                        
                        info2["so_thua"] = st1
                        info2["label_area"] = lbl_area1
                        info2["ma_loai_dat"] = info1.get("ma_loai_dat")
                        info2["label_src"] = "Neighbor-Move-Fix"
                        info2["note"] = f"[Sửa lỗi] Chuyển từ P{idx1} sang P{idx2}"
                        
                        info1["so_thua"] = None
                        info1["label_area"] = None
                        info1["ma_loai_dat"] = None
                        info1["label_src"] = None
                        info1["note"] = None
                        
                        move_count += 1
                        break 
                        
                    # Case B: SWAP
                    else:
                        if src2.startswith("Step2") or src2.startswith("Case"): continue

                        st2 = info2.get("so_thua")
                        lbl_area2 = info2.get("label_area")
                        
                        if lbl_area2 is not None:
                            diff_swap_2_to_1 = abs(topo1 - lbl_area2)
                            current_total_diff = diff1 + abs(topo2 - lbl_area2)
                            new_total_diff = diff_if_move + diff_swap_2_to_1
                            
                            if new_total_diff < current_total_diff and diff_if_move < 0.5 and diff_swap_2_to_1 < 0.5:
                                self.log(f"   ⚡ SWAP: Đổi chỗ Thửa {st1} và Thửa {st2}")
                                
                                info1["so_thua"] = st2
                                info1["label_area"] = lbl_area2
                                info1["label_src"] = "Neighbor-Swap-Fix"
                                info1["note"] = f"[Sửa lỗi] Đổi với P{idx2} ({st1})"
                                
                                info2["so_thua"] = st1
                                info2["label_area"] = lbl_area1
                                info2["label_src"] = "Neighbor-Swap-Fix"
                                info2["note"] = f"[Sửa lỗi] Đổi với P{idx1} ({st2})"
                                
                                swap_count += 1
                                break 

        if move_count > 0 or swap_count > 0:
            self.log(f"✅ Đã rà soát và sửa: {move_count} Move, {swap_count} Swap.")
            self._update_table()




    def on_pick_out_dir(self):
        path = QFileDialog.getExistingDirectory(self, "Chọn thư mục xuất")
        if path:
            self.ed_out_dir.setText(path)

    # ===== BATCH PROCESSING =====
    def on_run_full_check(self):
        """Chạy toàn bộ quy trình cho TẤT CẢ các file đã load"""
        if not self.files: return
        
        total_files = len(self.files)
        error_count = 0
        ok_count = 0
        
        # Danh sách báo cáo chi tiết cho từng tờ bản đồ
        report_details = []
        
        self.log(f"\n🚀 BẮT ĐẦU CHẠY KIỂM TRA BATCH ({total_files} file)...")
        self.btn_run_full.setEnabled(False)
        self.is_batch_mode = True # Kích hoạt chế độ im lặng
        QApplication.processEvents()
        
        try:
            for i, file_data in enumerate(self.files):
                fname = os.path.basename(file_data["dxf_path"])
                self.log(f"\n---------------------------------------------------")
                self.log(f"📂 [{i+1}/{total_files}] Xử lý: {fname}")
                QApplication.processEvents()

                # 1. Reset State & Load Data for this file
                self.rows = file_data["rows"]
                self.dxf_path = file_data["dxf_path"]
                self.polys = None
                self.poly_info = None
                self.clusters = None
                
                # Apply level config from file if specific, matches global otherwise
                if file_data.get("selected_levels"):
                    self.boundary_levels = file_data["selected_levels"].get("boundary", [])
                
                # 2. Run Steps STRICTLY SEQUENTIAL
                try:
                    # Step 2: Topo
                    self.on_run_topo()
                    if not self.polys:
                        self.log(f"❌ {fname}: Lỗi tạo Topo. Bỏ qua.")
                        error_count += 1
                        continue
                        
                    # Step 3: Assign Basic (L13, L2, L4 - Within Poly)
                    self.on_assign_basic()
                    
                    # Step 4: Assign Arrow (Vector)
                    self.on_assign_arrow()
                    
                    # Step 5: Assign Small / Auto-Fix (Logic Neighbor mới nằm trong này)
                    self.on_assign_small_v2()
                    
                    # Step 6: Check & Export
                    has_errors, unassigned_polys, unassigned_texts = self._check_and_export_silent()
                    
                    # Report statistics for this file
                    self.log(f"   📊 Thống kê: Chưa gán {unassigned_polys} thửa, {unassigned_texts} text.")
                    report_details.append(
                        f"- Tờ {fname}: Chưa gán {unassigned_polys} thửa, {unassigned_texts} text."
                    )
    
                    if has_errors:
                        self.log(f"⚠️ {fname}: CÓ LỖI -> Đã xuất báo cáo.")
                        error_count += 1
                    else:
                        self.log(f"✅ {fname}: KHÔNG LỖI -> Bỏ qua xuất.")
                        ok_count += 1
                        
                except Exception as e:
                    self.log(f"❌ {fname}: Lỗi ngoại lệ: {e}")
                    import traceback
                    traceback.print_exc()
                    error_count += 1
                    report_details.append(f"- Tờ {fname}: Lỗi ngoại lệ (bỏ qua thống kê).")

            # Summary Alert ONLY ONCE at the end
            self.log(f"\n===================================================")
            self.log(f"📊 KẾT QUẢ TỔNG HỢP:")
            self.log(f"   • Tổng số tờ: {total_files}")
            self.log(f"   • Số tờ có lỗi: {error_count}")
            self.log(f"   • Số tờ OK: {ok_count}")
            self.log(f"===================================================")
            
            # Build final message text
            msg_lines = [
                f"Đã kiểm tra xong {total_files} file.",
                f"- Có lỗi (đã xuất báo cáo): {error_count}",
                f"- Không lỗi: {ok_count}",
                "",
                "Chi tiết chưa gán:"
            ]
            msg_lines.extend(report_details)
            
            QMessageBox.information(self, "Hoàn tất Batch", "\n".join(msg_lines))
    
        finally:
            self.is_batch_mode = False # Tắt chế độ im lặng
            self.btn_run_full.setEnabled(True)

    def _check_and_export_silent(self):
        """Hàm kiểm tra nội bộ, trả về True nếu có lỗi và đã xuất file"""
        if not self.dxf_path: return False
        
        out_dir = self.ed_out_dir.text()
        if not out_dir:
            out_dir = os.path.dirname(self.dxf_path)

        map_name = os.path.splitext(os.path.basename(self.dxf_path))[0]
        
        # Check logic
        err_area_data = []
        err_missing_l13_data = []
        
        for idx, info in enumerate(self.poly_info):
            # Check Area
            topo = info.get("topo_area", 0)
            label = info.get("label_area")
            if label is not None:
                diff = topo - label
                if abs(diff) > 0.5:
                    err_area_data.append({
                        "Tờ Bản đồ": map_name,
                        "Số thửa": info.get("so_thua"),
                        "DT nhãn": label,
                        "DT topo": topo,
                        "Chênh lệch": round(diff, 2)
                    })
            
            # Check Missing L13
            if info.get("so_thua") is None:
                # Tìm thửa hàng xóm (có số thửa) để giúp định vị
                neighbors = []
                poly = self.polys[idx]
                
                for idx2, poly2 in enumerate(self.polys):
                    if idx == idx2:
                        continue
                    
                    # Kiểm tra hàng xóm (tiếp xúc hoặc gần < 0.5m)
                    if poly.distance(poly2) < 0.5:
                        neighbor_so_thua = self.poly_info[idx2].get("so_thua")
                        if neighbor_so_thua is not None:
                            neighbors.append(str(neighbor_so_thua))
                
                # Tạo chuỗi thông tin hàng xóm
                neighbor_info = ", ".join(neighbors[:5]) if neighbors else "Không tìm thấy"
                if len(neighbors) > 5:
                    neighbor_info += f" (và {len(neighbors)-5} thửa khác)"
                
                err_missing_l13_data.append({
                    "Tờ Bản đồ": map_name,
                    "DT topo": info.get("topo_area", 0),
                    "Thửa hàng xóm": neighbor_info,
                    "Ghi chú": "Thiếu số thửa (L13)"
                })

        has_error = False
        if err_area_data or err_missing_l13_data:
            has_error = True
            # Create dir only if error
            target_dir = os.path.join(out_dir, map_name)
            os.makedirs(target_dir, exist_ok=True)
            
            if err_area_data:
                df = pd.DataFrame(err_area_data)
                df.to_excel(os.path.join(target_dir, "Lỗi diện tích.xlsx"), index=False)
            
            if err_missing_l13_data:
                df = pd.DataFrame(err_missing_l13_data)
                df.to_excel(os.path.join(target_dir, "Lỗi thiếu nhãn.xlsx"), index=False)

        return has_error

    def on_check(self):
        if not self.dxf_path: return
        out_dir = self.ed_out_dir.text()
        if not out_dir:
            out_dir = os.path.dirname(self.dxf_path)

        # Tạo thư mục theo tên file (yêu cầu user)
        map_name = os.path.splitext(os.path.basename(self.dxf_path))[0]
        target_dir = os.path.join(out_dir, map_name)
        os.makedirs(target_dir, exist_ok=True)

        self.log(f"🔄 Đang xuất báo cáo vào: {target_dir}")
        QApplication.processEvents()

        try:
            # --- 1. LỖI DIỆN TÍCH (DT Nhãn khác DT Topo > 0.5) ---
            err_area_data = []
            for idx, info in enumerate(self.poly_info):
                topo = info.get("topo_area", 0)
                label = info.get("label_area")
                
                if label is not None:
                    diff = topo - label
                    if abs(diff) > 0.5:
                        err_area_data.append({
                            "Tờ Bản đồ": map_name,
                            "Số thửa": info.get("so_thua"),
                            "Diện tích nhãn": label,
                            "Diện tích topo": topo,
                            "Chênh lệch": round(diff, 2)
                        })

            if err_area_data:
                df_area = pd.DataFrame(err_area_data)
                path_area = os.path.join(target_dir, "Lỗi diện tích nhãn sai khác với diện tích topo.xlsx")
                df_area.to_excel(path_area, index=False)
                self.log(f"   ❌ Xuất {len(err_area_data)} lỗi diện tích: {os.path.basename(path_area)}")
            else:
                self.log("   ✅ Không có lỗi chênh lệch diện tích > 0.5")

            # --- 2. LỖI THIẾU NHÃN LEVEL 13 (Chưa gán được số thửa) ---
            err_missing_l13_data = []
            for idx, info in enumerate(self.poly_info):
                if info.get("so_thua") is None:
                    err_missing_l13_data.append({
                        "Tờ Bản đồ": map_name,
                        "Diện tích topo": info.get("topo_area", 0),
                        "Ghi chú": "Thiếu số thửa (L13)"
                    })

            if err_missing_l13_data:
                df_missing = pd.DataFrame(err_missing_l13_data)
                path_missing = os.path.join(target_dir, "Lỗi thiếu nhãn level 13.xlsx")
                df_missing.to_excel(path_missing, index=False)
                self.log(f"   ⚠️ Xuất {len(err_missing_l13_data)} lỗi thiếu nhãn: {os.path.basename(path_missing)}")
            else:
                self.log("   ✅ Không có lỗi thiếu nhãn level 13")

            self.log(f"✅ Hoàn tất kiểm tra!")
            os.startfile(target_dir)

        except Exception as e:
            self.log(f"❌ Lỗi xuất báo cáo: {e}")
            import traceback
            self.log(traceback.format_exc())

    def _update_table(self):
        self.tbl_result.setRowCount(len(self.poly_info))
        
        from PyQt5.QtCore import Qt
        
        # Sort indices safely: None ("Chưa gán") -> Top (0), then by float value (1)
        def sort_key(item):
            idx, info = item
            st = info.get("so_thua")
            if st is None or str(st).strip() == "":
                return (0, 0.0)
            else:
                try:
                    return (1, float(str(st).strip()))
                except ValueError:
                    return (2, str(st).strip())

        sorted_items = sorted(enumerate(self.poly_info), key=sort_key)
        
        for display_row, (orig_idx, info) in enumerate(sorted_items):
            stt_item = QTableWidgetItem(str(display_row + 1))
            stt_item.setData(Qt.UserRole, orig_idx)
            self.tbl_result.setItem(display_row, 0, stt_item)
            
            self.tbl_result.setItem(display_row, 1, QTableWidgetItem(str(info.get("so_thua") or "")))
            self.tbl_result.setItem(display_row, 2, QTableWidgetItem(str(info.get("ma_loai_dat") or "")))

            dt_nhan = info.get("label_area")
            self.tbl_result.setItem(display_row, 3, QTableWidgetItem(f"{dt_nhan:.1f}" if dt_nhan else ""))

            dt_topo = info.get("topo_area", 0)
            self.tbl_result.setItem(display_row, 4, QTableWidgetItem(f"{dt_topo:.1f}"))

            if dt_nhan:
                diff = dt_topo - dt_nhan
                self.tbl_result.setItem(display_row, 5, QTableWidgetItem(f"{diff:.1f}"))
                self.tbl_result.setItem(display_row, 6, QTableWidgetItem("Đúng" if abs(diff) <= 0.5 else "Lệch"))
                # Color code
                if abs(diff) > 0.5:
                    self.tbl_result.item(display_row, 6).setBackground(QColor(255, 200, 200))  # Light Red
                else:
                    self.tbl_result.item(display_row, 6).setBackground(QColor(200, 255, 200))  # Light Green
            else:
                self.tbl_result.setItem(display_row, 5, QTableWidgetItem(""))
                self.tbl_result.setItem(display_row, 6, QTableWidgetItem("Chưa có DT"))

            self.tbl_result.setItem(display_row, 7, QTableWidgetItem(str(info.get("label_src") or "")))
            self.tbl_result.setItem(display_row, 8, QTableWidgetItem(str(info.get("note") or "")))


def main():
    if not _HAS_QGIS:
        print("Cần chạy trong môi trường QGIS Python")
        return

    # Khởi tạo QgsApplication
    qgs = QgsApplication([], True)
    qgs.initQgis()

    app = QApplication(sys.argv)
    window = StepByStepWindow()
    window.show()

    ret = app.exec_()
    qgs.exitQgis()
    sys.exit(ret)


if __name__ == "__main__":
    main()